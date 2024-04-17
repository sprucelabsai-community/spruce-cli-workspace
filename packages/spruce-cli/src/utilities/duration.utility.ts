const durationUtil = {
    msToFriendly(duration: number): string {
        let milliseconds = duration % 1000,
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

        let durationStr = ''

        if (hours > 0) {
            durationStr += `${hours}h `
        }

        if (hours > 0 || minutes > 0) {
            durationStr += `${minutes}m `
        }

        if (durationStr.length > 0 || seconds > 0) {
            durationStr += `${seconds}s `
        }

        if (hours === 0 && minutes === 0) {
            if (seconds > 0) {
                durationStr = `${seconds}.${milliseconds}s`
            } else {
                durationStr += `${milliseconds}ms`
            }
        }

        return durationStr.trim()
    },
}

export default durationUtil
