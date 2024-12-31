export interface TherapistRoute {
    username: string;
    email: string 
    password: string 
    gender: string
    birthday: Date;
    location: string
    phone: string
    registration: string
    specialities: String[],
    schedules:  String[]
}