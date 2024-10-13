import {create} from 'zustand'

type IconType = 'coin' | 'check' 

interface ToastProps {
    isVisible: boolean; 
    message: string;
    icon?:IconType;
    showToast: (message:string, icon?: IconType) => void;
    hideToast:()=>void
}

const TOAST_DISPLAY_DURATION = 1500; // 토스트 출력 시간 (ms)

const useToastStore = create<ToastProps>((set)=> ({
    isVisible:false,
    message:'',
    icon:null,
    showToast:(message, icon) => {
        set({isVisible:true, message, icon})

        setTimeout(()=> set({isVisible:false, icon: null}), TOAST_DISPLAY_DURATION)
    },
    hideToast: () => set({isVisible:false, icon: null})
}))

export default useToastStore



// interface ToastProps {
//     isVisible: boolean
//     message: string
//     icon?: IconType
//     showToast: (message: string, icon?: IconType) => void
//     hideToast: () => void
//   }
  
//   export const useToastStore = create<ToastProps>((set) => ({
//     isVisible: false,
//     message: '',
//     iconName: null,
//     showToast: (message, icon) => {
//       set({ isVisible: true, message, icon })
//       setTimeout(() => set({ isVisible: false, icon: null }), 1500)
//     },
//     hideToast: () => set({ isVisible: false, icon: null }),
//   }))
  