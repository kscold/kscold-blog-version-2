package com.kscold.blog.identity.application.port.in;

public interface UserManagementUseCase {

    /** 소프트 딜리트: deletedAt 세팅, 데이터는 보존 */
    void softDelete(String userId);

    /** 하드 딜리트: DB에서 완전 제거 (복구 불가) */
    void hardDelete(String userId);
}
