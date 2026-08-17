import type { User } from '../api'
import CarsSection from './CarsSection'
import RentalsSection from './RentalsSection'

interface DashboardProps {
  token: string
  user: User
}

function Dashboard({ token, user }: DashboardProps) {
  return (
    <div className="container dashboard">
      <h1>Dashboard</h1>
      <RentalsSection token={token} />
      <CarsSection token={token} canManage={user.role === 'owner'} />
    </div>
  )
}

export default Dashboard
