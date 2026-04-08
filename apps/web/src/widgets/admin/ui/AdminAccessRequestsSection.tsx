'use client';

import { useAccessRequests } from '@/widgets/admin/model/useAccessRequests';
import { AccessRequestCard } from '@/widgets/admin/ui/access-requests/AccessRequestCard';
import { AccessRequestsEmpty } from '@/widgets/admin/ui/access-requests/AccessRequestsEmpty';
import { AccessRequestsHeader } from '@/widgets/admin/ui/access-requests/AccessRequestsHeader';
import { AccessRequestsLoading } from '@/widgets/admin/ui/access-requests/AccessRequestsLoading';

export function AdminAccessRequestsSection() {
  const { requests, scopeById, loading, handleRequest, selectScope } = useAccessRequests();

  return (
    <div className="space-y-6">
      <AccessRequestsHeader requestCount={requests.length} />

      {loading ? (
        <AccessRequestsLoading />
      ) : requests.length === 0 ? (
        <AccessRequestsEmpty />
      ) : (
        <div className="space-y-3">
          {requests.map(request => (
            <AccessRequestCard
              key={request.id}
              request={request}
              selectedScope={scopeById[request.id] ?? (request.postId ? 'POST' : 'CATEGORY')}
              onSelectScope={selectScope}
              onHandle={handleRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}
