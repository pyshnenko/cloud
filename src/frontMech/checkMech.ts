export function urlCheck(str: string) {
    try {
        return !!new URL(str);
    }
      catch (_) {
        // Если URL оказался некорректным
        return false;
    }
}