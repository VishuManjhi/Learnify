import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  const markAsRead = async (notificationId: string) => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId, read: true }),
    })
    mutate()
  }

  return {
    notifications: data || [],
    isLoading,
    error,
    markAsRead,
  }
}
