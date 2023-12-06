// ---------------------------------------------------------- TOOL NAME COLLECTION

export const ToolName = {
    CHOOSE: 'choose',
    CHANGE_UNIT: 'change_unit',

    ROOM_TOOL: 'room_tool',
    DRAWING_ROOM: 'drawing_room',
    EDIT_ROOM: 'edit_room',
    ROOM_LIST: 'room_list',

    DETECTOR_TOOL: 'smoke_detector_tool',
    SET_DETECTOR: 'smoke_detector_manual',
    SET_BMZ: 'set_bmz',
    EDIT_DETECTOR: 'edit_detector',
    DETECTOR_LIST: 'smoke_detector_list',

    DISTANCE_TOOL: 'distance',
    WIRING_TOOL: 'wiring',

    IDEAS: 'ideas',

    MANUAL_CALL_POINT_TOOL: 'manual_call_point',
    CALL_POINT_SET: 'call_point_set',
    CALL_POINT_LIST: 'call_point_list',

    EMERGENCY_EXIT_LIST: 'emergency_exit_list',
    MARK_EMERGENCY_EXIT: 'mark_emergency_exit',

    FLOOR_TOOL: 'floor_tool',

    SYMBOL_TOOL: 'symbol_tool',
    SYMBOL_LIST: 'symbol_list',
    SYMBOL_USER_LIST: 'symbol_user_list',
} as const

// ---------------------------------------------------------- LAYER TOOL

export const LayerKey = {
    ROOMS: 'rooms',
    DOORS: 'doors',
    SMOKE_DETECTOR: 'smoke_detector',
    BMZ: 'bmz',
    WIRING: 'wiring',
    FIREWALLS: 'firewalls',
    FIRE_COMPARTMENTS: 'fire_compartments',
    ALARM_AREAS: 'alarm_areas',
    MANUAL_CALL_POINT: 'manual_call_point'
} as const;

export const LayerStatus = {
    OPEN: 1,
    CLOSE: 0,
} as const;

// ---------------------------------------------------------- DEFINE POLYGON TYPE

export const PolygonType = {
    ROOM: 'room',
    SMOKE_DETECTOR: 'smoke_detector',
    SYMBOL: 'symbol',
    WIRING: 'wiring',
    DOOR_EXIT: 'door_exit',
    UNIT: 'unit',
    MANUAL_CALL_POINT: 'manual_call_point',
    BMZ: 'bmz',
}

// ---------------------------------------------------------- LOADING STATUS

export const LoadingStatusEnum = {
    NONE: -1,
    INITIALIZING_TOOL: 1,
    LOADING_MODEL_DATA: 2,
    CHANGE_UNIT_PENDING: 3,
} as const

// ---------------------------------------------------------- ACCOUNT INFO

export const InfoAccount = [
    "email",
    "first_name",
    "last_name",
    "country",
    "company_name"
]