package com.kscold.blog.stackshare.domain.port.out;

import com.kscold.blog.stackshare.domain.model.StackShareAccount;
import java.util.Optional;

public interface StackShareAccountRepository {

    Optional<StackShareAccount> find();

    StackShareAccount save(StackShareAccount account);
}
