package com.kscold.blog.stackshare.adapter.out.persistence;

import com.kscold.blog.stackshare.domain.model.StackShareAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoStackShareAccountRepository
        extends MongoRepository<StackShareAccount, String> {}
