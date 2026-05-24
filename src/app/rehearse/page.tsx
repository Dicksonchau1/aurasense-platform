import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
export default function RehearseIndex() {
  redirect('/rehearse/nurse')
}
