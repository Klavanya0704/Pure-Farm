import re

with open('src/components/pages.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# For WeatherPage
content = re.sub(
    r'(export function WeatherPage.*?)className=\{cardClass\}',
    r'\1className={glassCardClass}',
    content,
    flags=re.DOTALL
)

# For CropCalendarPage
content = re.sub(
    r'(export function CropCalendarPage.*?)(<div className=\{cardClass\})',
    r'\1<div className={glassCardClass}',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'(export function CropCalendarPage.*?)(<div className=\{cardClass\})',
    r'\1<div className={glassCardClass}',
    content,
    flags=re.DOTALL
) # running it twice because there are two cardClass usages in CropCalendarPage

# For NotificationsPage (NotificationRow is used, which has its own class)
content = re.sub(
    r'(function NotificationRow.*?)border-border bg-card',
    r'\1border-white/45 bg-white/75 backdrop-blur-[16px] shadow-[0_10px_35px_rgba(0,0,0,0.10)] text-foreground',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'(function NotificationRow.*?)border-primary/35 bg-accent',
    r'\1border-[#2d6a4f]/45 bg-white/90 backdrop-blur-[16px] shadow-[0_10px_35px_rgba(0,0,0,0.15)] text-foreground',
    content,
    flags=re.DOTALL
)

# For OrderPage
content = re.sub(
    r'(export function OrderPage.*?)className=\{cardClass\}',
    r'\1className={glassCardClass}',
    content,
    flags=re.DOTALL
)

with open('src/components/pages.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated inner classes for glass styling.")
