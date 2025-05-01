
const App = () => {
  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Post */}
      <div className="border p-4 rounded shadow mb-4">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Humor · user1 · 1 day ago</p>
            <p className="text-gray-500 text-sm">Deskripsi singkat post...</p>
          </div>
          <button className="text-xl">❌</button>
        </div>
        <img
          src="https://via.placeholder.com/600x350"
          className="w-full mt-4 rounded"
          alt="post"
        />
        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
          <div className="flex space-x-4">
            <span>🔼 9.8k</span>
            <span>🔽</span>
            <span>💬</span>
          </div>
          <span>🔖</span>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Comments (1.1k)</h2>

        {/* Comment 1 */}
        <div className="border p-3 rounded">
          <p className="font-semibold">Username117 · 1 hour ago</p>
          <p>Komentar pertama...</p>
          <div className="text-sm text-gray-600 mt-1">🔼 170 🔽 7</div>
        </div>

        {/* Comment 2 */}
        <div className="border p-3 rounded">
          <p className="font-semibold">Username888 · 7 hour ago</p>
          <p>tralelo</p>
          <div className="text-sm text-gray-600 mt-1">🔼 12k 🔽 0</div>
        </div>
      </div>
    </div>
  )
}

export default App
