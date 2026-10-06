package com.kscold.blog.stackshare.domain.port.out;

import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StackShareSettlementRepository {

    StackShareSettlement save(StackShareSettlement settlement);

    List<StackShareSettlement> findRecent();

    /**
     * 정산 완료 시각만 고쳐 쓴다. 기록 전체를 다시 저장하지 않으므로 발송 당시 남긴 다른 값은 그대로 남는다.
     *
     * @param settledAt null 이면 완료 표시를 지운다
     * @return 고친 뒤의 정산 기록. 해당 기록이 없으면 비어 있다
     */
    Optional<StackShareSettlement> updateSettledAt(String id, LocalDateTime settledAt);
}
