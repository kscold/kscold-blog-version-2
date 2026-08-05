package com.kscold.blog.stackshare.domain.port.out;

import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import java.util.List;

public interface StackShareSettlementRepository {

    StackShareSettlement save(StackShareSettlement settlement);

    List<StackShareSettlement> findRecent();
}
