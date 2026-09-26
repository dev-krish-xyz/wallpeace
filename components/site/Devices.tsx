/**
 * Plain CSS device frames for the premium demonstrations: a wallpaper reads as a wallpaper once it
 * sits in a screen. Every dimension is a percentage of the frame's own width, so one component
 * works at 560px on a desktop row and at 90px in a lineup.
 *
 * The 3D MacBook in the studio stays where it is; these are flat, cheap, and there are ten of them
 * on the page at once.
 */

type FrameProps = {
  className?: string;
  style?: React.CSSProperties;
  /** Goes inside the screen, which is `relative` and clipped — fill it. */
  children: React.ReactNode;
};

const BEZEL = "bg-[#1d1d1f]";
const METAL = "bg-[#c8cacd]";
const SCREEN = "relative overflow-hidden bg-fill";

/** Lid, screen, and the wrist-rest edge below it. 16:10, like the real thing. */
export function MacBookFrame({ className = "", style, children }: FrameProps) {
  return (
    <div className={className} style={style}>
      <div className={`relative rounded-[7px] p-[1.6%] shadow-card sm:rounded-[10px] ${BEZEL}`}>
        {/* Camera. At this size it is one pixel of hint, which is all it needs to be. */}
        <div aria-hidden className="absolute inset-x-0 top-[1%] mx-auto size-[2px] rounded-full bg-white/25" />
        <div className={`${SCREEN} aspect-[16/10] rounded-[3px] sm:rounded-[5px]`}>{children}</div>
      </div>
      {/* Wider than the lid, as a closed MacBook is, with the notch you open it by. */}
      <div aria-hidden className={`relative mx-[-3.5%] h-[5px] rounded-b-[5px] ${METAL}`}>
        <div className="absolute inset-x-0 top-0 mx-auto h-[2px] w-[13%] rounded-b-[3px] bg-[#adb0b5]" />
      </div>
    </div>
  );
}

/** Portrait iPad: even bezel, no button. */
export function IPadFrame({ className = "", style, children }: FrameProps) {
  return (
    <div className={className} style={style}>
      <div className={`rounded-[9px] p-[2.2%] shadow-card sm:rounded-[12px] ${BEZEL}`}>
        <div className={`${SCREEN} aspect-[3/4] rounded-[6px] sm:rounded-[8px]`}>{children}</div>
      </div>
    </div>
  );
}

/** iPhone, island and all. */
export function IPhoneFrame({ className = "", style, children }: FrameProps) {
  return (
    <div className={className} style={style}>
      <div className={`rounded-[12px] p-[3.6%] shadow-card sm:rounded-[15px] ${BEZEL}`}>
        <div className={`${SCREEN} aspect-[9/19.5] rounded-[8px] sm:rounded-[11px]`}>
          {children}
          <div
            aria-hidden
            className="absolute inset-x-0 top-[1.6%] mx-auto h-[2.4%] w-[34%] rounded-full bg-black/80"
          />
        </div>
      </div>
    </div>
  );
}

/** A desktop display on a stand. 16:9, so three of them line up as one wide picture. */
export function MonitorFrame({ className = "", style, children }: FrameProps) {
  return (
    <div className={className} style={style}>
      <div className={`rounded-[4px] p-[1%] shadow-card sm:rounded-[6px] ${BEZEL}`}>
        <div className={`${SCREEN} aspect-[16/9] rounded-[2px] sm:rounded-[3px]`}>{children}</div>
      </div>
      <div aria-hidden>
        <div className={`mx-auto h-[7px] w-[13%] ${METAL}`} />
        <div className={`mx-auto h-[3px] w-[34%] rounded-[2px] ${METAL}`} />
      </div>
    </div>
  );
}
