import { Bars } from "react-loader-spinner";

/** An unclickable button to be rendered when an API request has been sent and is awaiting a response. */
// export function LoadingButton({
//   isOpaque = false,
//   height = 25,
//   width = 90,
//   className,
// }) {
//   let _className = className ?? "delete-btn";
//   let colour = "#FFA900";
//   if (isOpaque) {
//     className ?? (_className = "add-btn");
//     colour = "#FFFFFF";
//   }
//   return (
//     <button
//       type="button"
//       className={_className}
//       style={{ cursor: "not-allowed" }}
//     >
//       <div style={{ backgroundColor: "transparent" }}>
//         <Bars color={colour} height={height} width={width} />
//       </div>
//     </button>
//   );
// }

/** Renders a loading screen when the data hasn't loaded yet. */
export default function LoadingScreen({ size = 50, fullscreen = true }) {
  return (
    <div className="h-screen">
      <div className={fullscreen ? "loading-whole-screen" : ""}>
        <Bars color="#FFA900" height={size} width={size} />
      </div>
    </div>

  );
}
