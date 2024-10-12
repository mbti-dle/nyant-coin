import CloseIcon from '@mui/icons-material/Close'

const Modal = () => (
  <>
    <div>
      <h1>게임방법</h1>
      <CloseIcon className="cursor-pointer" />
      <p>각 플레이어는 게임 시작 시 1,000냥코인을 지급받습니다.</p>
      <p>생선 가격은 첫날 100냥코인으로 시작해, 매일 1~300냥코인 사이에서 변동됩니다.</p>
      <p>20초 안에 생선을 사고 팔아야 하며, '사기' 또는 '팔기' 버튼을 눌러 거래할 수 있습니다.</p>
      <p>최종적으로 가장 많은 냥코인을 모은 플레이어가 우승합니다.</p>
      <p>최적의 타이밍에 거래해서 우승을 차지하세요!</p>
    </div>
  </>
)

export default Modal
