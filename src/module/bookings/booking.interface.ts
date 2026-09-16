export interface CreateBooking {
  resourceId: string;
  startTime: string;
  endTime: string;
}
export interface UpdateBooking {
  startTime: string;
  endTime: string;
}