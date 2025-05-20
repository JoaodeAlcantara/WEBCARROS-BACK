export function verifyData(data) {
    if ('name' in data && !data.name ||
        'model' in data && !data.model ||
        'transmission' in data && !data.transmission ||
        'images' in data && !data.images ||
        'year' in data && !data.year ||
        'kilometersRun' in data && !data.kilometersRun ||
        'price' in data && !data.price ||
        'category' in data && !data.category ||
        'fuel' in data && !data.fuel ||
        'city' in data && !data.city ||
        'contactPhone' in data && !data.contactPhone ||
        'description' in data && !data.description
    ){
        return false
    }
    return true
};