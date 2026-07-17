export type Attendance = 'yes' | 'no'
export type ChildrenAnswer = 'yes' | 'no'

export type RsvpPayload = {
  fullName: string
  attendance: Attendance
  alcohol: string[]
  alcoholOther: string
  hasChildren: boolean
  childrenCount: number
}
