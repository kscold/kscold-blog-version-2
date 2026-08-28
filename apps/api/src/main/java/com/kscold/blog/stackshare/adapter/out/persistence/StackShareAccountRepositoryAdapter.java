package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareAccount;
import com.kscold.blog.stackshare.domain.port.out.StackShareAccountRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class StackShareAccountRepositoryAdapter implements StackShareAccountRepository {

    private final MongoStackShareAccountRepository mongoRepository;

    @Override
    public Optional<StackShareAccount> find() {
        return mongoRepository.findById(StackShareAccount.SINGLETON_ID);
    }

    @Override
    public StackShareAccount save(StackShareAccount account) {
        // 계좌는 한 건만 유지하므로 항상 고정 id로 덮어쓴다.
        account.setId(StackShareAccount.SINGLETON_ID);
        return mongoRepository.save(account);
    }
}
