/**
 * Represents the roles available in the system.
 */
enum Role {
    ADMIN = 'admin',
    USER = 'user',
    SUPER_ADMIN = 'super_admin'
}

/**
 * Represents the status of a user.
 */
enum UserStatus {
    VERIFIED = 'verified',
    UNVERIFIED = 'unverified',
    DISABLED = 'disabled'
}

/**
 * Represents the status of a project.
 */
enum ProjectStatus {
    STARTED = 'started',
    DATA_COLLECTED = 'data-collected',
    PROCESSING = 'processing',
    FINISHED = 'finished',
    ERROR = 'error',
}

/**
 * Enum representing the types of heating for HVAC systems.
 */
enum HvacHeatingType {
    NONE = 'NONE',
    FOSSIL_FUEL = 'FOSSIL FUEL',
    ELECTRIC = 'ELECTRIC'
}

/**
 * Represents the AshraeType enumeration.
 */
enum AshraeType {
    NONE = 'NONE',
    ASHRAE_90_1_2007 = '90.1-2007',
}

/**
 * Represents the type of a building.
 */
enum BuildingType {
    NONE = 'NONE',
    AUTOMOTIVE_FACILITY = 'AUTOMOTIVE FACILITY',
    CONVENTION_CENTER = 'CONVENTION CENTER',
    COURTHOUSE = 'COURTHOUSE',
    DINNING_BAR_LOUNGE_LEISURE = 'DINING BAR LOUNGE/LEISURE',
    DINNING_CAFETERIA_FAST_FOOD = 'DINING CAFETERIA/FAST FOOD',
    DINNING_FAMILY = 'DINING FAMILY',
    DORMITORY = 'DORMITORY',
    EXERCISE_CENTER = 'EXERCISE CENTER',
    FIRE_STATIONS = 'FIRE STATIONS',
    GYMNASIUM = 'GYMNASIUM',
    HEALTHCARE_CLINIC = 'HEALTHCARE/CLINIC',
    HOSPITAL = 'HOSPITAL',
    HOTEL = 'HOTEL',
    LIBRARY = 'LIBRARY',
    MANUFACTURING = 'MANUFACTURING',
    MOTEL = 'MOTEL',
    MOTION_PICTURE_THEATRE = 'MOTION PICTURE/THEATRE',
    MULTI_FAMILY = 'MULTI-FAMILY',
    MUSEUM = 'MUSEUM',
    OFFICE = 'OFFICE',
    PARKING_GARAGE = 'PARKING GARAGE',
    PENITENTIARY = 'PENITENTIARY',
    PERFORMANCE_ARTS_THEATER = 'PERFORMANCE ARTS THEATER',
    POLICE_STATIONS = 'POLICE STATIONS',
    POST_OFFICE = 'POST OFFICE',
    RELIGIOUS_BUILDINGS = 'RELIGIOUS BUILDINGS',
    RETAIL = 'RETAIL',
    SCHOOL_UNIVERSITY = 'SCHOOL/UNIVERSITY',
    SPORTS_ARENA = 'SPORTS ARENA',
    TOWN_HALL = 'TOWN HALL',
    TRANSPORTATION = 'TRANSPORTATION',
    WAREHOUSE = 'WAREHOUSE',
    WORKSHOP = 'WORKSHOP',
}

/**
 * Represents the schedule types.
 */
enum ScheduleType {
    N2_5_NONRESIDENTIAL = 'N2-5 Non Residential',
    N2_6_HOTEL_FUNCTION = 'N2-6 Hotel Function',
    N2_7_RESIDENTIAL_WITH_SETBACK = 'N2-7 Residential, with Setback',
    N2_8_RESIDENTIAL_WITH_SETBACK = 'N2-8 Residential, without Setback',
    N2_9_RETAIL = 'N2-9 Retail',
}

export { Role, UserStatus, ProjectStatus, HvacHeatingType, AshraeType, BuildingType, ScheduleType }