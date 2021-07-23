import { createAction, props } from '@ngrx/store'
import {
  ITypeTrackerReq,
  ITypeTrackerRes,
  RealTimeResponse,
} from '@app/src/app/models'

export const updateTypeTracker = createAction(
  '[typeTracker] update Type Tracker',
  props<{ model: ITypeTrackerReq }>()
)

export const updateTypeTrackerSuccess = createAction(
  '[typeTracker] update Type Tracker Success',
  props<{ payload: RealTimeResponse<ITypeTrackerRes> }>()
)

export const updateTypeTrackerFailure = createAction(
  '[typeTracker] update Type Tracker Failure',
  props<{ payload: any }>()
)

export const upsertTypeTrackerViaEvent = createAction(
  '[typeTracker] upsert Type Tracker Via Event',
  props<{ model: ITypeTrackerRes }>()
)
