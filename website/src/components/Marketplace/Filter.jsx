export default function Filter({ name, onChange, active, filterGroup }) {
  const type = active ? 'REMOVE' : 'ADD';
  return (
    <button
      className={`
        ${
          active
            ? 'bg-primary text-white hover:bg-primaryDark'
            : 'bg-gray-200 text-text1 hover:bg-gray-300'
        }
        transition-all duration-75
        rounded-md inline-block px-3 py-1
      `}
      onClick={() => onChange({ type, filter: name, filterGroup })}
    >
      <p className="p-0 m-0 text-sm">{name}</p>
    </button>
  );
}
