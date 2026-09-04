package com.kscold.blog.stackshare.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.notification.application.port.in.AlimtalkTemplateUseCase;
import com.kscold.blog.notification.application.port.in.MessageDeliveryUseCase;
import com.kscold.blog.notification.domain.model.AlimtalkTemplate;
import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import com.kscold.blog.stackshare.application.dto.SaveStackShareAccountCommand;
import com.kscold.blog.stackshare.application.dto.SaveStackShareGroupCommand;
import com.kscold.blog.stackshare.application.dto.SaveStackShareParticipantCommand;
import com.kscold.blog.stackshare.application.dto.SendStackShareNotificationsCommand;
import com.kscold.blog.stackshare.application.dto.StackShareRecipientCommand;
import com.kscold.blog.stackshare.application.dto.StackShareSettlementCommand;
import com.kscold.blog.stackshare.application.port.in.StackShareManagementUseCase;
import com.kscold.blog.stackshare.domain.model.StackShareAccount;
import com.kscold.blog.stackshare.domain.model.StackShareGroup;
import com.kscold.blog.stackshare.domain.model.StackShareMessage;
import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import com.kscold.blog.stackshare.domain.model.StackShareSendResult;
import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import com.kscold.blog.stackshare.domain.port.out.StackShareAccountRepository;
import com.kscold.blog.stackshare.domain.port.out.StackShareGroupRepository;
import com.kscold.blog.stackshare.domain.port.out.StackShareNotificationSender;
import com.kscold.blog.stackshare.domain.port.out.StackShareParticipantRepository;
import com.kscold.blog.stackshare.domain.port.out.StackShareSettlementRepository;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StackShareManagementApplicationService implements StackShareManagementUseCase {

    private static final String TEMPLATE_KEY = "STACK_SHARE_SETTLEMENT";
    private static final Pattern MOBILE_PATTERN = Pattern.compile("01[016789]\\d{7,8}");

    /** 입금 기한을 비워둔 경우 알림톡에 대신 넣을 문구. 변수는 비워 보낼 수 없어 기본값이 필요함. */
    private static final String DUE_DATE_FALLBACK = "협의";

    private final StackShareParticipantRepository participantRepository;
    private final StackShareSettlementRepository settlementRepository;
    private final StackShareAccountRepository accountRepository;
    private final StackShareGroupRepository groupRepository;
    private final StackShareNotificationSender notificationSender;
    private final AlimtalkTemplateUseCase templateUseCase;
    private final MessageDeliveryUseCase messageDeliveryUseCase;

    @Override
    public StackShareAccount getAccount() {
        return accountRepository.find().orElseGet(StackShareAccount::new);
    }

    @Override
    public StackShareAccount saveAccount(SaveStackShareAccountCommand command) {
        String bankName = normalizeText(command.bankName());
        String accountNumber = normalizeText(command.accountNumber());
        String accountHolder = normalizeText(command.accountHolder());
        String contactPhone = normalizePhone(command.contactPhone());
        if (bankName.isBlank() || accountNumber.isBlank() || accountHolder.isBlank()) {
            throw invalidInput("은행명, 계좌번호, 예금주를 모두 입력해주세요.");
        }
        if (!MOBILE_PATTERN.matcher(contactPhone).matches()) {
            throw invalidInput("연락처를 휴대전화 번호 형식으로 입력해주세요.");
        }
        StackShareAccount account = getAccount();
        account.setBankName(bankName);
        account.setAccountNumber(accountNumber);
        account.setAccountHolder(accountHolder);
        account.setContactPhone(contactPhone);
        return accountRepository.save(account);
    }

    @Override
    public List<StackShareParticipant> getParticipants() {
        return participantRepository.findAllByOrderByNameAsc();
    }

    @Override
    public StackShareParticipant saveParticipant(SaveStackShareParticipantCommand command) {
        String phoneNumber = normalizePhone(command.phoneNumber());
        validateParticipant(command.name(), phoneNumber);
        StackShareParticipant participant = findParticipant(command.id(), phoneNumber);
        participant.setName(command.name().trim());
        participant.setPhoneNumber(phoneNumber);
        participant.setEmail(normalizeText(command.email()));
        participant.setUserId(normalizeText(command.userId()));
        participant.setActive(true);
        return participantRepository.save(participant);
    }

    @Override
    public void deleteParticipant(String id) {
        participantRepository.deleteById(id);
    }

    @Override
    public List<StackShareGroup> getGroups() {
        return groupRepository.findAllByOrderByNameAsc();
    }

    @Override
    public StackShareGroup saveGroup(SaveStackShareGroupCommand command) {
        String name = normalizeText(command.name());
        if (name.isBlank()) {
            throw invalidInput("그룹 이름을 입력해주세요.");
        }
        // 같은 이름이 이미 있으면 그 그룹을 고쳐준다. 이름으로 찾아 쓰는 묶음이라 중복이 생기면 헷갈린다.
        StackShareGroup group =
                findGroup(command.id())
                        .or(() -> groupRepository.findByName(name))
                        .orElseGet(StackShareGroup::new);
        group.setName(name);
        group.setDefaultToolName(normalizeText(command.defaultToolName()));
        group.setIncludeOwner(command.includeOwner());
        group.setParticipantIds(
                command.participantIds() == null
                        ? new ArrayList<>()
                        : command.participantIds().stream()
                                .filter(id -> id != null && !id.isBlank())
                                .distinct()
                                .collect(Collectors.toCollection(ArrayList::new)));
        return groupRepository.save(group);
    }

    @Override
    public void deleteGroup(String id) {
        groupRepository.deleteById(id);
    }

    private java.util.Optional<StackShareGroup> findGroup(String id) {
        return (id == null || id.isBlank())
                ? java.util.Optional.empty()
                : groupRepository.findById(id);
    }

    @Override
    public List<StackShareSettlement> getSettlements() {
        return settlementRepository.findRecent();
    }

    @Override
    public StackShareSendResult createAndSend(SendStackShareNotificationsCommand command) {
        validateSettlement(command);
        AlimtalkTemplate template = templateUseCase.getTemplate(TEMPLATE_KEY);
        if (!template.isSendable()) {
            throw invalidInput("승인된 KSCOLD 정산 알림톡 템플릿 ID를 먼저 등록해주세요.");
        }
        // 계좌가 없으면 받는 사람이 입금할 곳을 알 수 없으므로 발송 자체를 막는다.
        StackShareAccount account = getAccount();
        if (!account.isConfigured()) {
            throw invalidInput("입금 계좌를 먼저 등록해주세요. 계좌 없이는 정산 알림톡을 보낼 수 없습니다.");
        }

        StackShareSettlement settlement = createSettlement(command, account);
        settlementRepository.save(settlement);
        try {
            StackShareSendResult result = send(settlement, template.getExternalTemplateId());
            settlement.setStatus(StackShareSettlement.Status.SENT);
            settlement.setMessageGroupId(result.groupId());
            settlement.setSentAt(LocalDateTime.now());
            settlementRepository.save(settlement);
            recordDelivery(settlement, result.groupId(), null);
            return result;
        } catch (RuntimeException exception) {
            settlement.setStatus(StackShareSettlement.Status.FAILED);
            settlementRepository.save(settlement);
            recordDelivery(settlement, null, exception.getMessage());
            throw exception;
        }
    }

    /** 누구에게 무엇이 나갔는지 남긴다. 그룹 아이디가 있으면 나중에 실제 도달 여부를 다시 조회할 수 있다. */
    private void recordDelivery(
            StackShareSettlement settlement, String groupId, String failureReason) {
        List<MessageDeliveryLog> logs =
                settlement.getRecipients().stream()
                        .map(
                                recipient -> {
                                    String summary =
                                            "%s %s 분담금 %s"
                                                    .formatted(
                                                            settlement.getBillingPeriod(),
                                                            settlement.getToolName(),
                                                            formatWon(recipient.getAmount()));
                                    MessageDeliveryLog log =
                                            failureReason == null
                                                    ? MessageDeliveryLog.sent(
                                                            MessageDeliveryLog.Channel.ALIMTALK,
                                                            TEMPLATE_KEY,
                                                            recipient.getPhoneNumber(),
                                                            recipient.getName(),
                                                            summary)
                                                    : MessageDeliveryLog.failed(
                                                            MessageDeliveryLog.Channel.ALIMTALK,
                                                            TEMPLATE_KEY,
                                                            recipient.getPhoneNumber(),
                                                            recipient.getName(),
                                                            summary,
                                                            failureReason);
                                    log.setProviderGroupId(groupId);
                                    return log;
                                })
                        .toList();
        messageDeliveryUseCase.recordAll(logs);
    }

    private StackShareParticipant findParticipant(String id, String phoneNumber) {
        if (id != null && !id.isBlank()) {
            return participantRepository.findById(id).orElseGet(StackShareParticipant::new);
        }
        return participantRepository
                .findByPhoneNumber(phoneNumber)
                .orElseGet(StackShareParticipant::new);
    }

    private StackShareSettlement createSettlement(
            SendStackShareNotificationsCommand command, StackShareAccount account) {
        StackShareSettlementCommand source = command.settlement();
        int receiverCount = command.recipients().size();
        // 본인을 포함하면 나누는 인원이 한 명 늘어난다. 본인에게는 알림톡을 보내지 않는다.
        int shareCount = receiverCount + (source.includeOwner() ? 1 : 0);
        long baseAmount = source.totalAmount() / shareCount;
        long remainder = source.totalAmount() % shareCount;
        List<StackShareSettlement.Recipient> recipients = new ArrayList<>();

        for (int index = 0; index < receiverCount; index++) {
            StackShareRecipientCommand recipient = command.recipients().get(index);
            StackShareParticipant participant =
                    saveParticipant(
                            new SaveStackShareParticipantCommand(
                                    null,
                                    recipient.name(),
                                    recipient.phoneNumber(),
                                    recipient.email(),
                                    null));
            recipients.add(
                    StackShareSettlement.Recipient.builder()
                            .participantId(participant.getId())
                            .name(participant.getName())
                            .phoneNumber(participant.getPhoneNumber())
                            .amount(
                                    baseAmount
                                            + (index < remainderForReceivers(source, remainder)
                                                    ? 1
                                                    : 0))
                            .build());
        }
        String dueDate = normalizeText(source.dueDate());
        return StackShareSettlement.builder()
                .toolName(source.toolName().trim())
                .billingPeriod(source.billingPeriod().trim())
                .totalAmount(source.totalAmount())
                .dueDate(dueDate.isBlank() ? DUE_DATE_FALLBACK : dueDate)
                .accountText(account.toDisplayText())
                .contactText(account.toContactText())
                .recipients(recipients)
                .shareCount(shareCount)
                .includeOwner(source.includeOwner())
                .ownerAmount(source.includeOwner() ? baseAmount + remainder : 0)
                .status(StackShareSettlement.Status.DRAFT)
                .build();
    }

    /**
     * 나누어떨어지지 않은 나머지를 받는 사람에게 1원씩 더 물릴지 결정한다. 본인이 분담에 끼어 있으면 결제한 사람이 나머지를 떠안는 편이 자연스러우므로 받는 사람에게는
     * 나머지를 넘기지 않는다.
     */
    private long remainderForReceivers(StackShareSettlementCommand source, long remainder) {
        return source.includeOwner() ? 0 : remainder;
    }

    private StackShareSendResult send(StackShareSettlement settlement, String templateId) {
        MessageContext context = new MessageContext(settlement, templateId);
        List<StackShareMessage> messages =
                settlement.getRecipients().stream()
                        .map(recipient -> toMessage(context, recipient))
                        .toList();
        return notificationSender.send(messages);
    }

    private StackShareMessage toMessage(
            MessageContext context, StackShareSettlement.Recipient recipient) {
        StackShareSettlement settlement = context.settlement();
        // Map.of 는 10쌍까지만 받으므로 변수를 더 늘릴 때는 형태를 바꿔야 함.
        Map<String, String> variables =
                Map.of(
                        "#{이름}", recipient.getName(),
                        "#{정산기간}", settlement.getBillingPeriod(),
                        "#{서비스명}", settlement.getToolName(),
                        "#{총금액}", formatWon(settlement.getTotalAmount()),
                        "#{참여인원}", String.valueOf(settlement.getShareCount()),
                        "#{분담금}", formatWon(recipient.getAmount()),
                        "#{입금계좌}", settlement.getAccountText(),
                        "#{입금기한}", settlement.getDueDate(),
                        "#{연락처}", settlement.getContactText());
        return new StackShareMessage(recipient.getPhoneNumber(), context.templateId(), variables);
    }

    private void validateSettlement(SendStackShareNotificationsCommand command) {
        if (command == null || command.settlement() == null || command.recipients() == null) {
            throw invalidInput("정산 정보와 참여자를 입력해주세요.");
        }
        StackShareSettlementCommand settlement = command.settlement();
        if (settlement.toolName() == null
                || settlement.toolName().isBlank()
                || settlement.billingPeriod() == null
                || settlement.billingPeriod().isBlank()
                || settlement.totalAmount() <= 0
                || command.recipients().isEmpty()) {
            throw invalidInput("서비스명, 정산 기간, 금액과 참여자를 확인해주세요.");
        }
    }

    private void validateParticipant(String name, String phoneNumber) {
        if (name == null || name.isBlank() || !MOBILE_PATTERN.matcher(phoneNumber).matches()) {
            throw invalidInput("참여자 이름과 휴대전화 번호를 확인해주세요.");
        }
    }

    private String normalizePhone(String value) {
        return value == null ? "" : value.replaceAll("[^0-9]", "");
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String formatWon(long amount) {
        return NumberFormat.getNumberInstance(Locale.KOREA).format(amount) + "원";
    }

    private BusinessException invalidInput(String message) {
        return new BusinessException(ErrorCode.INVALID_INPUT_VALUE, message);
    }

    private record MessageContext(StackShareSettlement settlement, String templateId) {}
}
