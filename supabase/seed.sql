-- ==============================================================================
-- PURE FARM SEED DATA (SAMPLE & INITIAL DATA)
-- ==============================================================================

-- Sample Market Prices
INSERT INTO public.market_prices (crop_name, market_name, location, state, price, unit, change_pct, source)
VALUES
  ('Wheat (Sharbati)', 'Indore Mandi', 'Indore', 'Madhya Pradesh', 2850.00, 'quintal', 1.8, 'Mandi Agmarknet'),
  ('Paddy (Basmati 1121)', 'Karnal Grain Market', 'Karnal', 'Haryana', 4200.00, 'quintal', -0.5, 'Mandi Agmarknet'),
  ('Soybean (Yellow)', 'Ujjain Krishi Upaj', 'Ujjain', 'Madhya Pradesh', 4650.00, 'quintal', 2.3, 'Mandi Agmarknet'),
  ('Cotton (Medium Staple)', 'Rajkot APMC', 'Rajkot', 'Gujarat', 7100.00, 'quintal', 0.0, 'Mandi Agmarknet'),
  ('Maize (Kharif)', 'Davanagere APMC', 'Davanagere', 'Karnataka', 2150.00, 'quintal', 1.2, 'Mandi Agmarknet'),
  ('Mustard Seed', 'Jaipur Mandi', 'Jaipur', 'Rajasthan', 5450.00, 'quintal', -1.1, 'Mandi Agmarknet'),
  ('Gram (Chana Desi)', 'Latur APMC', 'Latur', 'Maharashtra', 5800.00, 'quintal', 0.8, 'Mandi Agmarknet'),
  ('Tomato (Hybrid)', 'Kolar APMC', 'Kolar', 'Karnataka', 1600.00, 'quintal', -4.2, 'Mandi Agmarknet'),
  ('Onion (Red)', 'Lasalgaon APMC', 'Nashik', 'Maharashtra', 2400.00, 'quintal', 3.5, 'Mandi Agmarknet'),
  ('Potato (Jyoti)', 'Agra Mandi', 'Agra', 'Uttar Pradesh', 1450.00, 'quintal', 0.5, 'Mandi Agmarknet')
ON CONFLICT DO NOTHING;

-- Sample Cold Storage Facilities
INSERT INTO public.cold_storage (name, address, latitude, longitude, distance, capacity, available_capacity, contact_number, status)
VALUES
  ('Kisan Shetkari Cold Chain', 'NH-48, Lasalgaon Road, Nashik', 19.9975, 73.7898, 12.5, 5000.00, 1850.00, '+91 98230 11223', 'operational'),
  ('Shree Ganesh Agri Cold Storage', 'Sector 14, APMC Market Yard, Vashi, Navi Mumbai', 19.0760, 72.8777, 24.0, 8000.00, 3200.00, '+91 98200 44556', 'operational'),
  ('Malwa Agro Refrigeration Depot', 'Sanwer Road Industrial Area, Indore', 22.7196, 75.8577, 8.2, 6500.00, 2400.00, '+91 94250 88990', 'operational'),
  ('Punjab Agri Warehouse & Cold Store', 'GT Road, Near Grain Market, Karnal', 29.6857, 76.9905, 15.0, 10000.00, 4500.00, '+91 98120 33445', 'operational'),
  ('GreenValley Multi-Commodity Cold Storage', 'Whitefield-Hoskote Road, Bengaluru', 12.9716, 77.5946, 18.3, 4200.00, 1100.00, '+91 98450 77661', 'operational')
ON CONFLICT DO NOTHING;
