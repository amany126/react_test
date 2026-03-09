function BackendStatusCard({ status, response }) {
  return (
    <div className="card">
      <p>Backend status: {status}</p>
      {response && <p>Service: {response.service}</p>}
      {response && <p>Time: {response.timestamp}</p>}
    </div>
  )
}

export default BackendStatusCard
