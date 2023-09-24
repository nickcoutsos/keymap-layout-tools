import { useEffect, useState } from 'react'

const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')

export default function useDarkModePreference () {
  const [media, setMedia] = useState(darkModePreference.matches)

  useEffect(() => {
    function handleChange (event) {
      setMedia(event.matches)
    }

    darkModePreference.addEventListener('change', handleChange)
    return () => darkModePreference.removeEventListener('change', handleChange)
  })

  return media
}
