'use client'

import { ExtendFormModal } from '@/components/global/modal/extend-form-modal'
import { useEffect, useState } from 'react'

const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return <ExtendFormModal />
}
export default ModalProvider
