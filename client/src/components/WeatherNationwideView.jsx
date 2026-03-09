import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function WeatherNationwideView({ title, language }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerLayerRef = useRef(null)
  const markerZIndexRef = useRef(1000)
  const [selectedMarkerId, setSelectedMarkerId] = useState(null)

  const cityPoints = useMemo(
    () => [
      { id: 'seoul', name: { ko: '서울', en: 'Seoul' }, lat: 37.5665, lon: 126.978 },
      { id: 'incheon', name: { ko: '인천', en: 'Incheon' }, lat: 37.4563, lon: 126.7052 },
      { id: 'suwon', name: { ko: '수원', en: 'Suwon' }, lat: 37.2636, lon: 127.0286 },
      { id: 'chuncheon', name: { ko: '춘천', en: 'Chuncheon' }, lat: 37.8813, lon: 127.7298 },
      { id: 'gangneung', name: { ko: '강릉', en: 'Gangneung' }, lat: 37.7519, lon: 128.8761 },
      { id: 'cheongju', name: { ko: '청주', en: 'Cheongju' }, lat: 36.6424, lon: 127.489 },
      { id: 'daejeon', name: { ko: '대전', en: 'Daejeon' }, lat: 36.3504, lon: 127.3845 },
      { id: 'jeonju', name: { ko: '전주', en: 'Jeonju' }, lat: 35.8242, lon: 127.148 },
      { id: 'daegu', name: { ko: '대구', en: 'Daegu' }, lat: 35.8714, lon: 128.6014 },
      { id: 'pohang', name: { ko: '포항', en: 'Pohang' }, lat: 36.019, lon: 129.3435 },
      { id: 'gwangju', name: { ko: '광주', en: 'Gwangju' }, lat: 35.1595, lon: 126.8526 },
      { id: 'busan', name: { ko: '부산', en: 'Busan' }, lat: 35.1796, lon: 129.0756 },
      { id: 'ulsan', name: { ko: '울산', en: 'Ulsan' }, lat: 35.5396, lon: 129.3114 },
      { id: 'changwon', name: { ko: '창원', en: 'Changwon' }, lat: 35.2281, lon: 128.6811 },
      { id: 'mokpo', name: { ko: '목포', en: 'Mokpo' }, lat: 34.8118, lon: 126.3922 },
      { id: 'jeju', name: { ko: '제주', en: 'Jeju' }, lat: 33.4996, lon: 126.5312 },
    ],
    [],
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cityWeather, setCityWeather] = useState([])
  const [updatedAt, setUpdatedAt] = useState('')

  const text = useMemo(() => {
    if (language === 'en') {
      return {
        loading: 'Loading nationwide weather data...',
        retry: 'Retry',
        subtitle: 'Current weather by major regions in South Korea',
        now: 'Now',
      }
    }

    return {
      loading: '전국 기상 정보를 불러오는 중입니다...',
      retry: '다시 조회',
      subtitle: '대한민국 주요 지역 현재 날씨',
      now: '현재',
    }
  }, [language])

  const weatherCodeToIcon = (code) => {
    if (code === 0 || code === 1) {
      return '☀️'
    }

    if (code === 2 || code === 3) {
      return '⛅'
    }

    if (code === 45 || code === 48) {
      return '🌫️'
    }

    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return '🌧️'
    }

    if ([71, 73, 75].includes(code)) {
      return '❄️'
    }

    if (code === 95) {
      return '⛈️'
    }

    return '🌤️'
  }

  const loadNationwideWeather = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const results = await Promise.all(
        cityPoints.map(async (city) => {
          const query = new URLSearchParams({
            lat: String(city.lat),
            lon: String(city.lon),
            timezone: 'Asia/Seoul',
          })

          const response = await fetch(`/api/weather?${query.toString()}`)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = await response.json()

          return {
            ...city,
            temp: data.current?.temperature_2m,
            weatherCode: data.current?.weather_code,
          }
        }),
      )

      setCityWeather(results)
      setUpdatedAt(new Date().toLocaleString(language === 'en' ? 'en-US' : 'ko-KR'))
    } catch {
      setError(
        language === 'en'
          ? 'Failed to fetch nationwide weather data from backend.'
          : '백엔드에서 전국 기상 데이터를 가져오지 못했습니다.',
      )
    } finally {
      setLoading(false)
    }
  }, [cityPoints, language])

  useEffect(() => {
    loadNationwideWeather()
  }, [loadNationwideWeather])

  useEffect(() => {
    if (loading || error) {
      return
    }

    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView([36.2, 127.9], 7)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 10,
      minZoom: 6,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    map.setMaxBounds([
      [32.8, 124.5],
      [39.95, 131.9],
    ])

    markerLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerLayerRef.current = null
    }
  }, [loading, error])

  const getMarkerColor = (temp) => {
    if (typeof temp !== 'number') {
      return '#ffffff'
    }

    if (temp <= -5) {
      return '#bfdbfe'
    }

    if (temp <= 3) {
      return '#dbeafe'
    }

    if (temp <= 10) {
      return '#fef9c3'
    }

    if (temp <= 18) {
      return '#fde68a'
    }

    return '#fecaca'
  }

  const formatTemp = (value) => {
    if (typeof value !== 'number') {
      return '-'
    }

    return `${Math.round(value * 10) / 10}°C`
  }

  useEffect(() => {
    if (!markerLayerRef.current) {
      return
    }

    const layer = markerLayerRef.current
    layer.clearLayers()

    cityWeather.forEach((city) => {
      const icon = weatherCodeToIcon(city.weatherCode)
      const markerHtml = `
        <div class="korea-marker-card" style="background:${getMarkerColor(city.temp)};">
          <div class="korea-marker-icon">${icon}</div>
          <div class="korea-marker-name">${city.name[language]}</div>
          <div class="korea-marker-value">${formatTemp(city.temp)}</div>
        </div>
      `

      const marker = L.marker([city.lat, city.lon], {
        icon: L.divIcon({
          className: 'korea-weather-div-icon',
          html: markerHtml,
          iconSize: [114, 76],
          iconAnchor: [57, 38],
        }),
        zIndexOffset: city.id === selectedMarkerId ? markerZIndexRef.current : 0,
      })

      marker.on('click', () => {
        markerZIndexRef.current += 1
        marker.setZIndexOffset(markerZIndexRef.current)
        setSelectedMarkerId(city.id)
      })

      marker.addTo(layer)
    })
  }, [cityWeather, language, selectedMarkerId])

  return (
    <section className="weather-view">
      <h1>{title}</h1>
      <p className="view-description">{text.subtitle}</p>

      <div className="weather-panel weather-location-panel">
        <div className="weather-location-controls">
          <span className="weather-label">
            {text.now}: {updatedAt || '-'}
          </span>
          <button type="button" onClick={loadNationwideWeather} className="weather-retry-button">
            {text.retry}
          </button>
        </div>
      </div>

      {loading && <p className="view-description">{text.loading}</p>}

      {!loading && error && (
        <div className="weather-panel">
          <p className="view-description">{error}</p>
          <button type="button" onClick={loadNationwideWeather} className="weather-retry-button">
            {text.retry}
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="weather-panel">
          <div
            className="korea-map-container"
            aria-label={language === 'en' ? 'South Korea weather map' : '대한민국 날씨 지도'}
          >
            <div ref={mapContainerRef} className="korea-real-map" />
          </div>
        </div>
      )}
    </section>
  )
}

export default WeatherNationwideView
