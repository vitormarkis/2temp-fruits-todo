import axios from "axios"
import { useQuery, useQueryClient } from "react-query"
import { removeFruitFromCache } from "./utils"

export const baseURL = "http://localhost:3000/fruits"

export interface Fruit {
  id: string
  created_at: string
  fruit_name: string
  note: string
}

export function Fruits() {
  const queryClient = useQueryClient()

  const {
    data: fruits,
    isLoading,
    isError,
  } = useQuery<Fruit[]>(
    "fruits",
    async () => {
      const res = await axios.get(baseURL)
      return res.data
    },
    {
      staleTime: 1000 * 60, // 1 minute
    }
  )

  function handleDeleteFruit(fruitId: string) {
    removeFruitFromCache(fruitId, queryClient)
    axios.delete(`${baseURL}/${fruitId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-3">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-full w-[560px] text-sm p-4 rounded-lg bg-zinc-200 overflow-y-scroll scroll-">
      {fruits?.map((fruit) => (
        <div
          key={fruit.id}
          className="border-b-zinc-300 border-b mb-3 flex flex-col">
          <div className="flex gap-2 items-center">
            <div
              onClick={() => handleDeleteFruit(fruit.id)}
              className="text-white font-black cursor-pointer bg-red-700 rounded-full w-3 h-3 relative"
            />
            <p>{fruit.fruit_name}</p>
          </div>
          <p className="text-zinc-400 text-xs ml-8">{String(fruit.created_at)}</p>
        </div>
      ))}
    </div>
  )
}
