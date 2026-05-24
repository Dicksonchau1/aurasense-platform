import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
export default function DroneIndex() {
  redirect('/playground/attas')
}
