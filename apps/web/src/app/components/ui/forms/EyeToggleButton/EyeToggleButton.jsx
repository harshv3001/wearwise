export default function EyeToggleButton({ isVisible, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick((prev) => !prev)}
      className="absolute right-[10px] top-[38px] flex h-8 w-8 items-center justify-center rounded-full bg-white"
    >
      <span className="material-symbols-outlined text-[20px] leading-none text-[var(--ww-text-secondary)]">
        {isVisible ? "visibility_off" : "visibility"}
      </span>
    </button>
  );
}
