export const getFormattedHours = (date: Date | string) => {
    date = new Date(date);
    const timeString = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    return timeString;
}

export const formatCallDuration = (date: number) => {
    const hours = Math.floor(date / 3600);
    const minutes = Math.floor((date % 3600) / 60);
    const seconds = date % 60;
    if (hours > 0) {
        if (hours < 10) {
            return `0${hours}:${minutes}:${seconds}`;
        }
        else {
            return `${hours}:${minutes}:${seconds}`;
        }
    }
    if (minutes < 10) {
        if (seconds < 10) {
            return `0${minutes}:0${seconds}`;
        }
        else {
            return `0${minutes}:${seconds}`;
        }
    }
    else {
        if (seconds < 10) {
            return `${minutes}:0${seconds}`;
        }
        else {
            return `${minutes}:${seconds}`;
        }
    }
}

export const formatDate = (date: Date | string) => {
    date = new Date(date);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return "Today";
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }
    
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    if (date > lastWeek) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
        });
    }
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
}

export const formatFileSize = (size: number) => {
    if (size < 1024) {
        return `${size} B`;
    }
    else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    }
    else if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
    else {
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
}

export const formatDateForInput = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
}