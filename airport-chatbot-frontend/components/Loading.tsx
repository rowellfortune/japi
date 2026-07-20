export default function Loading() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:100ms]"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:200ms]"></div>
        </div>
      </div>
    </div>
  );
}
