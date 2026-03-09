import { useEffect, useRef, useState } from 'react'

function WebMaskingView({ title }) {
  const defaultShapeSize = 72
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const interactionRef = useRef({ mode: null, maskId: null, startX: 0, startY: 0, origin: null })
  const [sourceImage, setSourceImage] = useState(null)
  const [sourceFileName, setSourceFileName] = useState('image.png')
  const [sourceFileHandle, setSourceFileHandle] = useState(null)
  const [placeMode, setPlaceMode] = useState(null)
  const [selectedMaskId, setSelectedMaskId] = useState(null)
  const [shapeType, setShapeType] = useState('rect')
  const [masks, setMasks] = useState([])

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return { x: 0, y: 0 }
    }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  const getMaskBounds = (mask) => {
    return {
      x: mask.x,
      y: mask.y,
      width: mask.width,
      height: mask.height,
    }
  }

  const getMaskAtPoint = (x, y) => {
    for (let index = masks.length - 1; index >= 0; index -= 1) {
      const mask = masks[index]
      const bounds = getMaskBounds(mask)
      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        return { mask, bounds }
      }
    }

    return null
  }

  const isOnResizeHandle = (x, y, bounds) => {
    const handleSize = 14
    return (
      x >= bounds.x + bounds.width - handleSize &&
      x <= bounds.x + bounds.width + 2 &&
      y >= bounds.y + bounds.height - handleSize &&
      y <= bounds.y + bounds.height + 2
    )
  }

  const drawMasksOnContext = (context, { showSelection }) => {
    masks.forEach((mask) => {
      context.fillStyle = '#000000'

      if (mask.shape === 'rect') {
        context.fillRect(mask.x, mask.y, mask.width, mask.height)
      }

      if (mask.shape === 'circle') {
        context.beginPath()
        context.ellipse(
          mask.x + mask.width / 2,
          mask.y + mask.height / 2,
          mask.width / 2,
          mask.height / 2,
          0,
          0,
          Math.PI * 2,
        )
        context.fill()
      }

      if (showSelection && mask.id === selectedMaskId) {
        const bounds = getMaskBounds(mask)
        context.strokeStyle = '#22c55e'
        context.lineWidth = 2
        context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
        context.fillStyle = '#22c55e'
        context.fillRect(bounds.x + bounds.width - 8, bounds.y + bounds.height - 8, 12, 12)
      }
    })
  }

  const drawCanvasScene = (context, { showSelection }) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    if (!sourceImage) {
      context.fillStyle = '#e5e7eb'
      context.fillRect(0, 0, context.canvas.width, context.canvas.height)
      context.fillStyle = '#4b5563'
      context.font = '600 18px system-ui'
      context.fillText('이미지를 업로드하면 마스킹 미리보기가 표시됩니다.', 20, 40)
      return
    }

    context.canvas.width = sourceImage.width
    context.canvas.height = sourceImage.height
    context.drawImage(sourceImage, 0, 0)
    drawMasksOnContext(context, { showSelection })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    drawCanvasScene(context, { showSelection: true })
  }, [sourceImage, masks, selectedMaskId])

  const applyLoadedImage = (file, image, fileHandle = null) => {
    setSourceImage(image)
    setSourceFileName(file.name || 'image.png')
    setSourceFileHandle(fileHandle)
    setMasks([])
    setSelectedMaskId(null)
    setPlaceMode(null)
  }

  const loadSourceFile = (file, fileHandle = null) => {
    if (!file) {
      return
    }

    const imageUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      applyLoadedImage(file, image, fileHandle)
      URL.revokeObjectURL(imageUrl)
    }

    image.src = imageUrl
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    loadSourceFile(file, null)
    event.target.value = ''
  }

  const openImagePicker = async () => {
    if (window.showOpenFilePicker) {
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'Image Files',
              accept: {
                'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'],
              },
            },
          ],
          excludeAcceptAllOption: false,
          multiple: false,
        })

        if (!fileHandle) {
          return
        }

        const file = await fileHandle.getFile()
        loadSourceFile(file, fileHandle)
        return
      } catch (error) {
        if (error?.name === 'AbortError') {
          return
        }
      }
    }

    fileInputRef.current?.click()
  }

  const startPlaceShape = () => {
    if (!sourceImage) {
      return
    }

    setPlaceMode('shape')
  }

  const handleCanvasMouseDown = (event) => {
    if (event.shiftKey) {
      void openImagePicker()
      return
    }

    if (!sourceImage) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const point = getCanvasPoint(event)

    if (placeMode === 'shape') {
      const createdMask = {
        id: `shape-${Date.now()}`,
        shape: shapeType,
        width: defaultShapeSize,
        height: defaultShapeSize,
        x: point.x - defaultShapeSize / 2,
        y: point.y - defaultShapeSize / 2,
      }

      setMasks((prev) => [...prev, createdMask])
      setSelectedMaskId(createdMask.id)
      setPlaceMode(null)
      return
    }

    const target = getMaskAtPoint(point.x, point.y)
    if (!target) {
      setSelectedMaskId(null)
      interactionRef.current = { mode: null, maskId: null, startX: 0, startY: 0, origin: null }
      return
    }

    setSelectedMaskId(target.mask.id)

    interactionRef.current = {
      mode: isOnResizeHandle(point.x, point.y, target.bounds) ? 'resize' : 'drag',
      maskId: target.mask.id,
      startX: point.x,
      startY: point.y,
      origin: {
        x: target.mask.x,
        y: target.mask.y,
        width: target.mask.width,
        height: target.mask.height,
      },
    }
  }

  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current
    if (!sourceImage || !canvas || !interactionRef.current.mode) {
      return
    }

    const point = getCanvasPoint(event)
    const { mode, maskId, startX, startY, origin } = interactionRef.current
    const deltaX = point.x - startX
    const deltaY = point.y - startY

    setMasks((prev) =>
      prev.map((mask) => {
        if (mask.id !== maskId) {
          return mask
        }

        if (mode === 'drag') {
          const bounds = getMaskBounds(mask)
          const maxX = sourceImage.width - bounds.width
          const maxY = sourceImage.height - bounds.height

          return {
            ...mask,
            x: clamp(origin.x + deltaX, 0, Math.max(0, maxX)),
            y: clamp(origin.y + deltaY, 0, Math.max(0, maxY)),
          }
        }

        if (mode === 'resize') {
          return {
            ...mask,
            width: clamp(origin.width + deltaX, 12, 1200),
            height: clamp(origin.height + deltaY, 12, 1200),
          }
        }

        return mask
      }),
    )
  }

  const handleCanvasMouseUp = () => {
    interactionRef.current = { mode: null, maskId: null, startX: 0, startY: 0, origin: null }
  }

  const deleteSelectedMask = () => {
    if (!selectedMaskId) {
      return
    }

    setMasks((prev) => prev.filter((mask) => mask.id !== selectedMaskId))
    setSelectedMaskId(null)
  }

  const createMaskedImageBlob = async () => {
    if (!sourceImage) {
      return null
    }

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = sourceImage.width
    exportCanvas.height = sourceImage.height
    const exportContext = exportCanvas.getContext('2d')
    if (!exportContext) {
      return null
    }

    drawCanvasScene(exportContext, { showSelection: false })

    return new Promise((resolve, reject) => {
      exportCanvas.toBlob((result) => {
        if (result) {
          resolve(result)
          return
        }

        reject(new Error('마스킹 이미지 생성에 실패했습니다.'))
      }, 'image/png')
    })
  }

  const writeBlobToHandle = async (fileHandle, blob) => {
    const permission = await fileHandle.queryPermission({ mode: 'readwrite' })
    const isGranted = permission === 'granted'
    const isRequested = !isGranted
      ? (await fileHandle.requestPermission({ mode: 'readwrite' })) === 'granted'
      : true

    if (!isRequested) {
      return false
    }

    const writable = await fileHandle.createWritable()
    await writable.write(blob)
    await writable.close()
    return true
  }

  const saveMaskedImage = async () => {
    if (!sourceImage) {
      return
    }

    try {
      const blob = await createMaskedImageBlob()
      if (!blob) {
        return
      }

      const baseName = sourceFileName.replace(/\.[^./\\]+$/, '') || 'image'
      const suggestedFileName = `${baseName}-masked.png`

      if (window.showSaveFilePicker) {
        const saveHandle = await window.showSaveFilePicker({
          suggestedName: suggestedFileName,
          types: [
            {
              description: 'PNG Image',
              accept: { 'image/png': ['.png'] },
            },
          ],
        })

        const saved = await writeBlobToHandle(saveHandle, blob)
        if (saved) {
          return
        }
      }

      const link = document.createElement('a')
      link.download = suggestedFileName
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      if (error?.name !== 'AbortError') {
        alert('마스킹 이미지 저장 중 오류가 발생했습니다.')
      }
    }
  }

  const replaceOriginalImage = async () => {
    if (!sourceImage) {
      return
    }

    if (!sourceFileHandle) {
      alert('원본 대체 저장을 위해 파일 선택기에서 원본 이미지를 다시 열어주세요.')
      return
    }

    try {
      const blob = await createMaskedImageBlob()
      if (!blob) {
        return
      }

      if (sourceFileHandle) {
        const saved = await writeBlobToHandle(sourceFileHandle, blob)
        if (saved) {
          return
        }
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        alert('원본 대체 저장 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <>
      <h1>{title}</h1>

      <section className="masking-panel">
        <input
          ref={fileInputRef}
          id="mask-image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        <div className="masking-inline-controls">
          <div className="settings-row">
            <label htmlFor="mask-shape-type">도형 타입</label>
            <select
              id="mask-shape-type"
              value={shapeType}
              onChange={(event) => setShapeType(event.target.value)}
            >
              <option value="rect">사각형</option>
              <option value="circle">원형</option>
            </select>
          </div>
        </div>

        <div className="masking-actions">
          <button
            type="button"
            className={placeMode === 'shape' ? 'active-action' : ''}
            onClick={startPlaceShape}
          >
            도형 마스크 배치
          </button>
          <button type="button" onClick={deleteSelectedMask}>
            선택 마스크 삭제
          </button>
          <button type="button" onClick={() => setMasks([])}>
            마스크 초기화
          </button>
          <button type="button" onClick={saveMaskedImage}>
            마스킹 이미지 저장
          </button>
          <button type="button" onClick={replaceOriginalImage}>
            원본 대체 저장
          </button>
        </div>

        <p className="masking-help-text">
          1) 미리보기 영역 클릭으로 이미지 선택 → 2) 도형 마스크 배치 선택 → 3) 이미지 원하는 위치 클릭으로 생성 → 4) 드래그로 이동, 우하단 핸들 드래그로 크기 조절 (이미지 교체: Shift+클릭)
        </p>
      </section>

      <div
        className={`masking-preview ${sourceImage ? '' : 'empty'}`}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          if (!sourceImage || event.shiftKey) {
            void openImagePicker()
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            void openImagePicker()
          }
        }}
        aria-label="이미지 파일 선택"
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={520}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>
    </>
  )
}

export default WebMaskingView