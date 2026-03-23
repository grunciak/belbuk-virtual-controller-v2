const typeDefs = `
  scalar DateTime
  scalar PeriodTime
  scalar SpecialDate

  enum DayOfWeek {
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
    SUNDAY
    CUSTOM_1
    CUSTOM_2
  }

  enum FaultType {
    TAMPER
    PRIME_POWER_SUPPLY
    ALTERNATIVE_POWER_SUPPLY
    HARDWARE
  }

  enum ValueType {
    INTEGER
    DOUBLE
    BOOLEAN
    MULTIVAL
    USERID
  }

  enum EventConfirmResult {
    UNKNOWN
    CONFIRMED
    NOT_FOUND
    ERROR
  }

  enum RestoreAlarmResult {
    UNKNOWN
    RESTORED
    STILL_ALARM_CONDITION
    ALARM_NOT_ACTIVE
  }

  enum ControlZoneResult {
    UNKNOWN
    BLOCKED_MAINS
    BLOCKED_BACKUP
    BLOCKED_FAULT
    BLOCKED_TAMPER
    BLOCKED_SENSOR
    ZONE_DISARMED
    ZONE_ARMED
    ZONE_TEST_ENDED
    ZONE_UNBLOCKED
  }

  enum TestZoneResult {
    UNKNOWN
    STARTED
    ALREADY_STARTED
    DISARM_REQUIRED
  }

  enum BlockZoneResult {
    UNKNOWN
    BLOCKED
    ALREADY_BLOCKED
    DISARM_REQUIRED
  }

  enum BlockZoneSensorResult {
    UNKNOWN
    BLOCKED
    ALREADY_BLOCKED
    NOT_SENSOR
  }

  enum UnblockZoneSensorResult {
    UNKNOWN
    UNBLOCKED
    ALREADY_UNBLOCKED
    NOT_SENSOR
  }

  enum ReleasePortalResult {
    UNKNOWN
    RELEASED
    EMERGENCY
  }

  enum EmergencyPortalResult {
    UNKNOWN
    DONE
    ALREADY_EMERGENCY
  }

  enum RestorePortalResult {
    UNKNOWN
    RESTORED
    STILL_EMERGENCY_CONDITION
    NORMAL_OPERATION
  }

  enum ManageAntipassbackResult {
    UNKNOWN
    ALREADY_SUSPENDED
    SUSPENDED
    ALREADY_RESUMED
    RESUMED
  }

  enum ReactivateAntipassbackResult {
    UNKNOWN
    REACTIVATED
  }

  type Token {
    mainToken: String!
    refreshToken: String!
  }

  type Value {
    type: ValueType!
    value: String!
  }

  type Point {
    id: ID!
    name: String!
    type: String!
    family: String!
    created: DateTime!
    value: Value!
  }

  type Input {
    id: ID!
    name: String!
  }

  type Output {
    id: ID!
    name: String!
  }

  type Reader {
    id: ID!
    name: String!
  }

  type ZoneDetector {
    input: Input!
    entryTime: Int
    exitTime: Int
  }

  type ZoneAlarm {
    output: Output!
    time: Int
  }

  type Zone {
    id: ID!
    name: String!
    controls: [Reader!]!
    detectors: [ZoneDetector!]!
    alarms: [ZoneAlarm!]!
  }

  type Portal {
    id: ID!
    name: String!
    entry: Reader!
    exit: Reader
    button: Input
    locking: Output!
    sensor: Input!
    release: Int!
    emergencies: [Input!]!
  }

  type Fault {
    fault: FaultType
    inputs: [Input!]!
  }

  type EventType {
    code: Int!
    symbol: String!
    desc: String!
  }

  type Configuration {
    site: ID!
    inputs: [Input!]!
    outputs: [Output!]!
    readers: [Reader!]!
    zones: [Zone!]!
    portals: [Portal!]!
    faults: [Fault!]!
    events: [EventType!]!
    tokenTTL: Int!
  }

  type SchedulerPeriod {
    day: DayOfWeek!
    start: PeriodTime!
    end: PeriodTime!
  }

  type Scheduler {
    id: ID!
    name: String!
    periods: [SchedulerPeriod]!
  }

  type SpecialDayType {
    id: ID!
    date: SpecialDate!
    day: DayOfWeek!
  }

  type ZoneAuth {
    zone: Zone!
    scheduler: Scheduler
    arm: Boolean!
    disarm: Boolean!
    test: Boolean!
  }

  type PortalAuth {
    portal: Portal!
    scheduler: Scheduler
  }

  type AccessLevel {
    id: ID!
    name: String!
    zones: [ZoneAuth!]!
    portals: [PortalAuth!]!
  }

  type UserCredential {
    card: String
    pin: String
  }

  type User {
    id: ID!
    name: String!
    credential: UserCredential
    expire: DateTime
    restore: Boolean!
    override: Boolean!
    access: [AccessLevel!]!
  }

  type Authorization {
    schedulers: [Scheduler!]!
    derogations: [SpecialDayType!]!
    access: [AccessLevel!]!
    users: [User!]!
  }

  type Group {
    id: ID!
    name: String!
    leader: Point
    points: [Point!]
    groups: [Group!]
  }

  type Resource {
    points: [Point!]!
    groups: [Group!]!
  }

  type Trigger {
    type: Int!
    template: String!
  }

  type Extension {
    id: ID!
    type: Int!
    value: String!
  }

  type Event {
    site: ID!
    id: ID!
    dateTime: DateTime!
    trigger: Trigger!
    reason: Point
    points: [Point!]
    extensions: [Extension!]
    user: User
    operator: Int
  }

  type EventConfirm {
    id: ID!
    status: EventConfirmResult!
  }

  # Input types for mutations

  input InputSchedulerPeriod {
    day: DayOfWeek!
    start: PeriodTime!
    end: PeriodTime!
  }

  input InputCreateScheduler {
    name: String!
    periods: [InputSchedulerPeriod]
  }

  input InputModifyScheduler {
    id: ID!
    name: String
    periods: [InputSchedulerPeriod]
  }

  input InputCreateSpecialDay {
    date: SpecialDate!
    day: DayOfWeek!
  }

  input InputModifySpecialDay {
    id: ID!
    date: SpecialDate
    day: DayOfWeek
  }

  input InputPortalAuth {
    portal: ID!
    scheduler: ID
  }

  input InputZoneAuth {
    zone: ID!
    scheduler: ID
    arm: Boolean!
    disarm: Boolean!
    test: Boolean!
  }

  input InputCreateAccessLevel {
    name: String!
    portalAuths: [InputPortalAuth!]
    zoneAuths: [InputZoneAuth!]
  }

  input InputModifyAccessLevel {
    id: ID!
    name: String
    portalAuths: [InputPortalAuth!]
    zoneAuths: [InputZoneAuth!]
  }

  input InputUserCredential {
    card: String
    pin: String
  }

  input InputCreateUser {
    name: String!
    credential: InputUserCredential
    expire: DateTime
    restore: Boolean!
    override: Boolean!
    access: [ID!]
  }

  input InputModifyUser {
    id: ID!
    name: String
    credential: InputUserCredential
    expire: DateTime
    restore: Boolean
    override: Boolean
    access: [ID!]
  }

  input InputUpdateScheduler {
    vid: ID!
    name: String!
    periods: [InputSchedulerPeriod!]!
  }

  input InputUpdateSpecialDay {
    date: SpecialDate!
    day: DayOfWeek!
  }

  input InputUpdateAccessLevel {
    vid: ID!
    name: String!
    portalAuths: [InputPortalAuth!]!
    zoneAuths: [InputZoneAuth!]!
  }

  input InputUpdateUser {
    name: String!
    credential: InputUserCredential
    expire: DateTime
    restore: Boolean!
    override: Boolean!
    access: [ID!]
  }

  input InputUpdateAuthorization {
    schedulers: [InputUpdateScheduler!]!
    derogations: [InputUpdateSpecialDay!]!
    access: [InputUpdateAccessLevel!]!
    users: [InputUpdateUser!]!
  }

  type Query {
    getAuthToken(login: String!, password: String!): Token!
    refreshAuthToken: Token!
    configuration: Configuration!
    authorization: Authorization!
    resource(points: [ID!], groups: [ID!]): Resource!
    getUnconfirmedEvents: Int!
  }

  type Mutation {
    echoEvent: Boolean!
    confirmEvent(id: [ID!]!): [EventConfirm!]
    setSiteIdentifier(id: ID!): Boolean!
    setTokenTTL(ttl: Int!): Boolean!

    createScheduler(input: [InputCreateScheduler!]!): [Scheduler]
    deleteScheduler(id: [Int!]!): [Int]
    modifyScheduler(input: [InputModifyScheduler!]!): [Scheduler]

    createSpecialDay(input: [InputCreateSpecialDay!]!): [SpecialDayType]
    deleteSpecialDay(id: [Int!]!): [Int]
    modifySpecialDay(input: [InputModifySpecialDay!]!): [SpecialDayType]

    createAccessLevel(input: [InputCreateAccessLevel!]!): [AccessLevel]
    deleteAccessLevel(id: [Int!]!): [Int]
    modifyAccessLevel(input: [InputModifyAccessLevel!]!): [AccessLevel]

    createUser(input: [InputCreateUser!]!): [User]
    deleteUser(id: [Int!]!): [Int]
    modifyUser(input: [InputModifyUser!]!): [User]

    updateAuthorization(input: InputUpdateAuthorization!): Authorization

    restoreTamper(operator: Int!): RestoreAlarmResult!
    restoreMains(operator: Int!): RestoreAlarmResult!
    restoreBackup(operator: Int!): RestoreAlarmResult!
    restoreFault(operator: Int!): RestoreAlarmResult!

    controlZone(zone: Int!, override: ControlZoneResult, operator: Int!): ControlZoneResult!
    restoreZone(zone: Int!, operator: Int!): RestoreAlarmResult!
    testZone(zone: Int!, operator: Int!): TestZoneResult!
    blockZone(zone: Int!, operator: Int!): BlockZoneResult!

    blockZoneSensor(sensor: Int!, operator: Int!): BlockZoneSensorResult!
    unblockZoneSensor(sensor: Int!, operator: Int!): UnblockZoneSensorResult!

    releasePortal(portal: Int!, operator: Int!): ReleasePortalResult!
    emergencyPortal(portal: Int!, operator: Int!): EmergencyPortalResult!
    restorePortal(portal: Int!, operator: Int!): RestorePortalResult!

    suspendAntipassback(operator: Int!): ManageAntipassbackResult!
    resumeAntipassback(operator: Int!): ManageAntipassbackResult!
    reactivateAntipassback(credential: String, operator: Int!): ReactivateAntipassbackResult!
  }

  type Subscription {
    events: [Event!]
  }
`;

module.exports = { typeDefs };
