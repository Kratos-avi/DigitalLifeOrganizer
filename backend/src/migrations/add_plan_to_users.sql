-- Migration: add plan column to users table
-- Run this once against your database to support the free/premium plan feature.
-- To add more plan types in the future (e.g. 'trial'), run:
--   ALTER TABLE users MODIFY COLUMN plan ENUM('free','premium','trial') NOT NULL DEFAULT 'free';
ALTER TABLE users
  ADD COLUMN plan ENUM('free', 'premium') NOT NULL DEFAULT 'free';
