import {
  CopyIcon,
  ArrowRightIcon,
  SendIcon,
  CheckIcon,
  ArrowBackIcon,
} from '../components/ui/icons'

const HomePage = () => (
  <main className="p-4">
    <h1 className="font-neodgm text-2xl">Home - 네오둥근 이거랑 다른가 Neodgm</h1>
    <h1 className="font-galmuri text-2xl">Home - 갈무리 이거랑 다른가 Galmuri</h1>
    <div className="flex space-x-4">
      <CopyIcon className="text-2xl text-gray-600" />
      <ArrowRightIcon className="text-2xl text-gray-600" />
      <SendIcon className="text-2xl text-gray-600" />
      <CheckIcon className="text-2xl text-gray-600" />
      <ArrowBackIcon className="text-2xl text-gray-600" />
    </div>
  </main>
)

export default HomePage
