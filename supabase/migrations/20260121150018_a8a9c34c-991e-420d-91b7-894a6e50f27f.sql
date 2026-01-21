-- Update buffer_after_mins to 30 for all coworking bookable types
UPDATE bookable_types 
SET buffer_after_mins = 30
WHERE business_id = 'c26074ed-db5b-4c28-b41c-8a31e388062c';

-- Also update deposit_percentage to 33% for day pass / hot desk (more reasonable than 0% or 100%)
UPDATE bookable_types 
SET deposit_percentage = 33
WHERE id = 'fc7a1c49-eb26-493f-ab8a-dbc341289189'; -- Hot Desk

UPDATE bookable_types 
SET deposit_percentage = 33
WHERE id = 'b0a62585-a220-4770-b460-ddb920940bc2'; -- Meeting Room

UPDATE bookable_types 
SET deposit_percentage = 33
WHERE id IN ('6952f66d-b20d-4978-b9e2-30432520aec4', '09b1c9e3-2dd2-471d-bfbc-4276d26a925c'); -- Dedicated/Private Office