import { useCallback, useEffect, useMemo, useState } from 'react'

function WeatherForecastView({ title, language }) {
  const locationOptions = useMemo(
    () => [
      {
        id: 'seoul',
        name: { ko: '서울', en: 'Seoul' },
        latitude: 37.5665,
        longitude: 126.978,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'incheon',
        name: { ko: '인천', en: 'Incheon' },
        latitude: 37.4563,
        longitude: 126.7052,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'daejeon',
        name: { ko: '대전', en: 'Daejeon' },
        latitude: 36.3504,
        longitude: 127.3845,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'daegu',
        name: { ko: '대구', en: 'Daegu' },
        latitude: 35.8714,
        longitude: 128.6014,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'gwangju',
        name: { ko: '광주', en: 'Gwangju' },
        latitude: 35.1595,
        longitude: 126.8526,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'busan',
        name: { ko: '부산', en: 'Busan' },
        latitude: 35.1796,
        longitude: 129.0756,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'ulsan',
        name: { ko: '울산', en: 'Ulsan' },
        latitude: 35.5396,
        longitude: 129.3114,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'jeju',
        name: { ko: '제주', en: 'Jeju' },
        latitude: 33.4996,
        longitude: 126.5312,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'gangneung',
        name: { ko: '강릉', en: 'Gangneung' },
        latitude: 37.7519,
        longitude: 128.8761,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'cheongju',
        name: { ko: '청주', en: 'Cheongju' },
        latitude: 36.6424,
        longitude: 127.489,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'jeonju',
        name: { ko: '전주', en: 'Jeonju' },
        latitude: 35.8242,
        longitude: 127.148,
        timezone: 'Asia/Seoul',
      },
      {
        id: 'pohang',
        name: { ko: '포항', en: 'Pohang' },
        latitude: 36.019,
        longitude: 129.3435,
        timezone: 'Asia/Seoul',
      },
    ],
    [],
  )

  const [selectedLocationId, setSelectedLocationId] = useState('seoul')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weatherData, setWeatherData] = useState(null)

  const text = useMemo(() => {
    if (language === 'en') {
      return {
        loading: 'Loading weather data...',
        retry: 'Retry',
        selectLocation: 'Location',
        fetchWeather: 'Load Forecast',
        currentWeather: 'Current Weather',
        forecast: '7-Day Forecast',
        temp: 'Temperature',
        wind: 'Wind Speed',
        max: 'Max',
        min: 'Min',
        noData: 'No weather data available.',
      }
    }

    return {
      loading: '기상 정보를 불러오는 중입니다...',
      retry: '다시 조회',
      selectLocation: '위치',
      fetchWeather: '예보 조회',
      currentWeather: '현재 날씨',
      forecast: '7일 예보',
      temp: '기온',
      wind: '풍속',
      max: '최고',
      min: '최저',
      noData: '기상 데이터가 없습니다.',
    }
  }, [language])

  const weatherCodeToLabel = (code) => {
    const labelsByCode = {
      0: language === 'en' ? 'Clear sky' : '맑음',
      1: language === 'en' ? 'Mainly clear' : '대체로 맑음',
      2: language === 'en' ? 'Partly cloudy' : '구름 조금',
      3: language === 'en' ? 'Overcast' : '흐림',
      45: language === 'en' ? 'Fog' : '안개',
      48: language === 'en' ? 'Rime fog' : '서리 안개',
      51: language === 'en' ? 'Light drizzle' : '이슬비',
      53: language === 'en' ? 'Drizzle' : '보통 이슬비',
      55: language === 'en' ? 'Dense drizzle' : '강한 이슬비',
      61: language === 'en' ? 'Slight rain' : '약한 비',
      63: language === 'en' ? 'Rain' : '비',
      65: language === 'en' ? 'Heavy rain' : '강한 비',
      71: language === 'en' ? 'Slight snow' : '약한 눈',
      73: language === 'en' ? 'Snow' : '눈',
      75: language === 'en' ? 'Heavy snow' : '강한 눈',
      80: language === 'en' ? 'Rain showers' : '소나기',
      81: language === 'en' ? 'Rain showers' : '강한 소나기',
      82: language === 'en' ? 'Violent showers' : '매우 강한 소나기',
      95: language === 'en' ? 'Thunderstorm' : '뇌우',
    }

    return labelsByCode[code] ?? (language === 'en' ? 'Unknown' : '알 수 없음')
  }

  const selectedLocation =
    locationOptions.find((location) => location.id === selectedLocationId) ?? locationOptions[0]

  const loadWeather = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const query = new URLSearchParams({
        lat: String(selectedLocation.latitude),
        lon: String(selectedLocation.longitude),
        timezone: selectedLocation.timezone,
      })

      const result = await fetch(`/api/weather?${query.toString()}`)
      if (!result.ok) {
        throw new Error(`HTTP ${result.status}`)
      }

      const data = await result.json()
      setWeatherData(data)
    } catch {
      setError(
        language === 'en'
          ? 'Failed to fetch weather data from backend.'
          : '백엔드에서 기상 데이터를 가져오지 못했습니다.',
      )
    } finally {
      setLoading(false)
    }
  }, [language, selectedLocation])

  useEffect(() => {
    loadWeather()
  }, [loadWeather])

  return (
    <section className="weather-view">
      <h1>{title}</h1>

      <div className="weather-panel weather-location-panel">
        <div className="weather-location-controls">
          <label htmlFor="weather-location-select" className="weather-label">
            {text.selectLocation}
          </label>
          <select
            id="weather-location-select"
            value={selectedLocationId}
            onChange={(event) => setSelectedLocationId(event.target.value)}
          >
            {locationOptions.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name[language]}
              </option>
            ))}
          </select>
          <button type="button" onClick={loadWeather} className="weather-retry-button">
            {text.fetchWeather}
          </button>
        </div>
      </div>

      {loading && <p className="view-description">{text.loading}</p>}

      {!loading && error && (
        <div className="weather-panel">
          <p className="view-description">{error}</p>
          <button type="button" onClick={loadWeather} className="weather-retry-button">
            {text.retry}
          </button>
        </div>
      )}

      {!loading && !error && weatherData && (
        <>
          <div className="weather-panel">
            <h2>{text.currentWeather}</h2>
            <div className="weather-current-grid">
              <div>
                <span className="weather-label">{text.temp}</span>
                <p>{weatherData.current.temperature_2m}°C</p>
              </div>
              <div>
                <span className="weather-label">{text.wind}</span>
                <p>{weatherData.current.wind_speed_10m} km/h</p>
              </div>
              <div>
                <span className="weather-label">{language === 'en' ? 'Condition' : '상태'}</span>
                <p>{weatherCodeToLabel(weatherData.current.weather_code)}</p>
              </div>
            </div>
          </div>

          <div className="weather-panel">
            <h2>{text.forecast}</h2>
            <div className="weather-forecast-list">
              {weatherData.daily.time.map((day, index) => (
                <div key={day} className="weather-forecast-item">
                  <strong>{day}</strong>
                  <span>{weatherCodeToLabel(weatherData.daily.weather_code[index])}</span>
                  <span>
                    {text.max}: {weatherData.daily.temperature_2m_max[index]}°C
                  </span>
                  <span>
                    {text.min}: {weatherData.daily.temperature_2m_min[index]}°C
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!loading && !error && !weatherData && <p className="view-description">{text.noData}</p>}
    </section>
  )
}

export default WeatherForecastView
