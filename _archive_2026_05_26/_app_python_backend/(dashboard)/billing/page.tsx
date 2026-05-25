// Billing & Plans Page
import { useBilling } from '../../../hooks/useBilling';

export default function BillingPlans() {
  const { plans, loading, error } = useBilling();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Billing & Plans</h1>
      <div className="card p-6 mb-8">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {plans.map(plan => (
            <div className="card p-4" key={plan.id}>
              <div className="font-semibold">Plan: {plan.name}</div>
              <div>Price: ${plan.price}/mo</div>
              <div>Quota: {plan.quota}</div>
              <div>Features: {plan.features}</div>
            </div>
          ))}
        </div>
        <div className="card p-4 mb-4">Usage Summary</div>
        <button className="btn btn-primary">Upgrade Plan</button>
      </div>
    </div>
  );
}