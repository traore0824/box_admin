export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  referral_code: string
  agent_client: boolean
}

export interface Caisse {
  id: number
  total_trans: number
  name: string
  start_date: string
  end_date: string
  amount: string
  status: string
  created_by: User
  created_at: string
  updated_at: string
  next_payment: string | null
  amount_obj: string
  amount_already_paid: string
  percentage_progession: string
  remaining_amount: number
  frequence: string
  is_active: boolean
  date_before_delete: string
  custom_frequence: any[]
  cancel_date: string | null
  transaction_delay: number
}

export interface Transaction {
  id: number
  public_reference: string
  created_at: string
  status: string
  payment_mode: string
  created_by: number
  amount: number
  reference: string | null
  caisse_id: string
  caisse: Caisse
  type_trans: string
  phone: string
}

export interface TransactionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Transaction[]
}
