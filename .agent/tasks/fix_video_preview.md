---
type: task
description: Fix video preview bug and improve recording app
status: in_progress
---

# תיקון באג התצוגה המקדימה + שיפורי קוד

## 🐛 הבעיה שזוהתה

כאשר משתמש מקליט מיוטיוב בכרום:
- **שמע**: עובד ✅
- **וידאו**: לא מוצג בתצוגה המקדימה ❌

### הסיבה הטכנית
ב-`useRecorder.ts` שורות 283-284:
```typescript
const screenVid = document.createElement('video');
screenVid.muted = true; screenVid.srcObject = screenStream;
await screenVid.play(); screenVideoRef.current = screenVid;
```

**הבעיה**: הווידאו נוצר אבל **לא מצורף ל-DOM**. דפדפנים מודרניים (במיוחד Chrome) דורשים שאלמנטי וידאו יהיו ב-DOM כדי שה-playback יעבוד כראוי.

## 🔧 התיקונים הנדרשים

### 1. תיקון core - הוספת video elements ל-DOM (קריטי) ⭐⭐⭐

**קובץ**: `useRecorder.ts`

**שינויים**:
- יצירת container נסתר ב-DOM לאחסון video elements
- הוספת `screenVideoRef` ו-`webcamVideoRef` ל-container
- **שורות לתיקון**: 283-284, 311-313

**קוד לתיקון**:
```typescript
// במקום:
const screenVid = document.createElement('video');
screenVid.muted = true; screenVid.srcObject = screenStream;

// צריך:
const screenVid = document.createElement('video');
screenVid.muted = true;
screenVid.playsInline = true;  // חשוב למובייל
screenVid.autoplay = true;     // אוטומטי לכל דפדפן
screenVid.style.position = 'absolute';
screenVid.style.top = '-9999px';  // מוסתר אבל ב-DOM
document.body.appendChild(screenVid);
screenVid.srcObject = screenStream;
```

### 2. ניקוי זיכרון - Cleanup של video elements (חשוב) ⭐⭐

**שינויים**:
- הוספת הסרה של video elements מה-DOM בזמן cleanup
- מניעת memory leaks

**פונקציה לעדכון**: `cleanup()`

### 3. טיפול ב-Ready State (שיפור) ⭐

**שינויים**:
- המתנה ל-`loadedmetadata` event במקום רק `play()`
- וידוא שה-video מוכן לפני שמתחילים compositing

### 4. שיפורי UX (נחמד להיות) ⭐

**שיפורים נוספים**:
- הוספת loading indicator בזמן הכנת התצוגה
- הודעת שגיאה ברורה יותר אם הווידאו לא נטען
- תמיכה טובה יותר ב-autoplay policies

## 📁 קבצים לעריכה

1. ✅ `hooks/useRecorder.ts` - תיקון עיקרי
2. ✅ `App.tsx` - שיפורי UI (אופציונלי)

## ✨ שיפורים נוספים מומלצים

1. **Error Handling משופר**
   - Catch על video play() failures
   - הודעות ברורות למשתמש

2. **Performance**
   - שימוש ב-`willReadFrequently: false` אם לא צריך
   - אופטימיזציה של drawing loop

3. **Accessibility**
   - ARIA labels לכפתורים
   - Keyboard shortcuts

## 📊 סדר ביצוע

1. **תיקון קריטי** (5 דקות): הוספת video ל-DOM
2. **Cleanup** (3 דקות): הסרה מה-DOM
3. **בדיקה** (2 דקות): ריצה ווידוא שהתצוגה עובדת
4. **שיפורים** (10 דקות): error handling + UX improvements

---

**סך הכל זמן משוער**: 20 דקות
**עדיפות**: 🔴 גבוהה מאוד
