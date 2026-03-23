import { format, addDays, nextMonday, getDay } from "date-fns"

const cache: Record<number, Record<string, string>> = {}

/**
 * Mueve la fecha al siguiente lunes si no cae ya en lunes.
 * (Ley Emiliani - Ley 51 de 1983)
 */
function getNextMondayIfNeeded(date: Date): Date {
  const day = getDay(date)
  if (day === 1) return date // 1 es Lunes
  return nextMonday(date)
}

/**
 * Algoritmo Computus (Meeus/Jones/Butcher)
 * Calcula la fecha del Domingo de Ramos (Pascua) para cualquier año.
 */
function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/**
 * Calcula dinámicamente todos los festivos de Colombia para un año específico.
 */
function calculateHolidays(year: number): Record<string, string> {
  const holidays: Record<string, string> = {}

  const addHoliday = (date: Date, name: string) => {
    holidays[format(date, "yyyy-MM-dd")] = name
  }

  // 1. Festivos Fijos (Nunca se mueven)
  addHoliday(new Date(year, 0, 1), "Año Nuevo") // 1 de Enero
  addHoliday(new Date(year, 4, 1), "Día del Trabajo") // 1 de Mayo
  addHoliday(new Date(year, 6, 20), "Día de la Independencia") // 20 de Julio
  addHoliday(new Date(year, 7, 7), "Batalla de Boyacá") // 7 de Agosto
  addHoliday(new Date(year, 11, 8), "Inmaculada Concepción") // 8 de Diciembre
  addHoliday(new Date(year, 11, 25), "Navidad") // 25 de Diciembre

  // 2. Ley Emiliani (Se mueven al siguiente lunes si caen entre martes y domingo)
  addHoliday(getNextMondayIfNeeded(new Date(year, 0, 6)), "Día de los Reyes Magos")
  addHoliday(getNextMondayIfNeeded(new Date(year, 2, 19)), "Día de San José")
  addHoliday(getNextMondayIfNeeded(new Date(year, 5, 29)), "San Pedro y San Pablo")
  addHoliday(getNextMondayIfNeeded(new Date(year, 7, 15)), "Asunción de la Virgen")
  addHoliday(getNextMondayIfNeeded(new Date(year, 9, 12)), "Día de la Raza")
  addHoliday(getNextMondayIfNeeded(new Date(year, 10, 1)), "Día de Todos los Santos")
  addHoliday(getNextMondayIfNeeded(new Date(year, 10, 11)), "Independencia de Cartagena")

  // 3. Festivos relativos a la Pascua (Domingo de Resurrección)
  const easter = getEasterSunday(year)
  
  // Semana Santa
  addHoliday(addDays(easter, -3), "Jueves Santo")
  addHoliday(addDays(easter, -2), "Viernes Santo")
  
  // Relativos a Pascua y sujetos a Ley Emiliani
  addHoliday(getNextMondayIfNeeded(addDays(easter, 39)), "Ascensión del Señor") 
  addHoliday(getNextMondayIfNeeded(addDays(easter, 60)), "Corpus Christi")
  addHoliday(getNextMondayIfNeeded(addDays(easter, 68)), "Sagrado Corazón de Jesús")

  return holidays
}

/**
 * Valida si una fecha dada es un festivo en Colombia.
 * Retorna { isHoliday: boolean, name?: string }
 */
export function isHolidayColombia(date: Date) {
  const year = date.getFullYear()
  
  // Cachear los cálculos por año para máxima eficiencia
  if (!cache[year]) {
    cache[year] = calculateHolidays(year)
  }
  
  const dateStr = format(date, "yyyy-MM-dd")
  const holidayName = cache[year][dateStr]
  
  if (holidayName) {
    return { isHoliday: true, name: holidayName }
  }
  
  return { isHoliday: false }
}
