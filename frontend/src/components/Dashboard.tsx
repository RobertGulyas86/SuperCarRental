import type { Rental, User } from '../api'
import CarsSection from './CarsSection'
import RentalsSection from './RentalsSection'

interface DashboardProps {
  token: string
  user: User
  onSelectCar: (carId: number) => void
  onSelectRental: (rental: Rental) => void
}

function Dashboard({ token, user, onSelectCar, onSelectRental }: DashboardProps) {
  return (
    <div className="container d-flex flex-column gap-4 gap-md-5">
      <h1 className="h2 mb-0">Dashboard</h1>
      <RentalsSection token={token} onSelectRental={onSelectRental} />
      {user.role === 'owner' && <CarsSection token={token} onSelectCar={onSelectCar} />}
    </div>
  )
}

export default Dashboard
