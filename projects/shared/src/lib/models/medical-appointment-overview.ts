export interface MedicalAppointmentOverview {
	averageAttendanceDurationMinutes: number;
	dailyAttendanceCounts: Array<DailyAttendanceCount>;
}

export interface DailyAttendanceCount {
	date: string;
	count: number;
}
