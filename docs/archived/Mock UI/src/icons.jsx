// Icon set — single-stroke 16px Linear/Lucide style. All inherit currentColor.

const I = (path, vb = "0 0 24 24") => ({ size = 16, className = "", style }) => (
  <svg
    width={size}
    height={size}
    viewBox={vb}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {path}
  </svg>
);

const IconLayers     = I(<><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></>);
const IconTag        = I(<><path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/></>);
const IconDollar     = I(<><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>);
const IconSettings   = I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>);
const IconUsers      = I(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></>);
const IconCal        = I(<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>);
const IconChart      = I(<><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-5"/></>);
const IconEye        = I(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>);
const IconSave       = I(<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></>);
const IconPublish    = I(<><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7"/><path d="M12 3v13M7 8l5-5 5 5"/></>);
const IconMenu       = I(<><path d="M3 6h18M3 12h18M3 18h18"/></>);
const IconPanelLeft  = I(<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>);
const IconPlus       = I(<><path d="M12 5v14M5 12h14"/></>);
const IconGrip       = I(<><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></>);
const IconTrash      = I(<><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>);
const IconCopy       = I(<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>);
const IconEdit       = I(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.4-9.4Z"/></>);
const IconChevron    = I(<><path d="m6 9 6 6 6-6"/></>);
const IconSearch     = I(<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>);
const IconSliders    = I(<><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>);
const IconInfo       = I(<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>);
const IconImg        = I(<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>);
const IconType       = I(<><path d="M4 7V4h16v3"/><path d="M9 20h6M12 4v16"/></>);
const IconHash       = I(<><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></>);
const IconList       = I(<><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".8"/><circle cx="3.5" cy="12" r=".8"/><circle cx="3.5" cy="18" r=".8"/></>);
const IconCheckSq    = I(<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>);
const IconToggle     = I(<><rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="16" cy="12" r="3"/></>);
const IconClock      = I(<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>);
const IconFile       = I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>);
const IconBuilding   = I(<><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></>);
const IconCards      = I(<><rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="4" width="8" height="16" rx="1"/></>);
const IconBranch     = I(<><circle cx="6" cy="3" r="2"/><circle cx="6" cy="21" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 5v14M6 12c0-2 2-3 4-3h4"/></>);
const IconClose      = I(<><path d="M18 6 6 18M6 6l12 12"/></>);
const IconArrUp      = I(<><path d="M5 12l7-7 7 7M12 19V5"/></>);
const IconArrDn      = I(<><path d="M5 12l7 7 7-7M12 5v14"/></>);
const IconKey        = I(<><circle cx="8" cy="15" r="4"/><path d="m10.85 12.15 6.65-6.65L20 8l-3 3 1.5 1.5L17 14l-1.5-1.5L13 15"/></>);

window.Icons = {
  Layers: IconLayers, Tag: IconTag, Dollar: IconDollar, Settings: IconSettings,
  Users: IconUsers, Cal: IconCal, Chart: IconChart, Eye: IconEye, Save: IconSave,
  Publish: IconPublish, Menu: IconMenu, PanelLeft: IconPanelLeft, Plus: IconPlus,
  Grip: IconGrip, Trash: IconTrash, Copy: IconCopy, Edit: IconEdit,
  Chevron: IconChevron, Search: IconSearch, Sliders: IconSliders, Info: IconInfo,
  Img: IconImg, Type: IconType, Hash: IconHash, List: IconList, CheckSq: IconCheckSq,
  Toggle: IconToggle, Clock: IconClock, File: IconFile, Building: IconBuilding,
  Cards: IconCards, Branch: IconBranch, Close: IconClose, ArrUp: IconArrUp, ArrDn: IconArrDn,
  Key: IconKey
};
