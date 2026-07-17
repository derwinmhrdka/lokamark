import { RegisterLontarForm } from './register-lontar-client'

export default function VisitorRegisterLontarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Register Lontar</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <RegisterLontarForm />
      </div>
    </div>
  )
}
