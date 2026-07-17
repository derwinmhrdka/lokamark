import { ApprovalList } from '@/components/admin/approval-list'

export default function ApprovalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Approval</h1>
      </div>
      <ApprovalList />
    </div>
  )
}
