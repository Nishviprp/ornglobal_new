import Signup from '../components/Auth/Signup'

function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md sm:p-8">
        <Signup />
      </div>
    </div>
  )
}

export default SignupPage
