# RPG Census

[RPG Census][rpg-census] generates names for your roleplaying game characters using data from the United States census. The names are chosen completely at random, which means that *James Smith* is just as likely be generated as *Elden Aalderink*. There is a tremendous diversity in American demographics, making RPG Census suitable for not only modern-day settings but also science fiction and even fantasy.

[» Try RPG Census][rpg-census]

RPG Census can also be used to create your own name generators, [as described below](#creating-your-own-generator).

[rpg-census]: http://census.jakobkallin.com/

## The data
RPG Census uses data from the 1990 U.S. census consisting of approximately 5,000 first names and almost 90,000 surnames. This data is freely [available at the United States Census Bureau's website][us-census].

[us-census]: http://www.census.gov/genealogy/www/data/1990surnames/names_files.html

## Creating your own generator
You can create your own generator for use in RPG Census by creating a file with the following format:

```yaml
title: American Top 3
patterns:
    Male: [male, " ", family]
    Female: [female, " ", family]
lists:
    male: [James, John, Robert]
    female: [Mary, Patricia, Linda]
    family: [Smith, Johnson, Williams]
```

Save the file with the extension `.yaml` (or download [`american-top-3.yaml`](https://raw.github.com/JakobKallin/RPG-Census/master/american-top-3.yml)) and then drag-and-drop it into RPG Census in order to start using it.

### Getting creative
When you start writing custom generators, RPG Census can be used for generating much more than just names. For example:

```yaml
title: City Professionals
patterns:
    West: [name, ", ", occupation, " from ", west]
    East: [name, ", ", occupation, " from ", east]
lists:
    name: [James, John, Robert, Mary, Patricia, Linda]
    occupation: [police officer, teacher, mechanic, reporter]
    west: [Los Angeles, San Francisco, Seattle]
    east: [New York, Boston, Miami]
```

### Generators with only one pattern
If your generator only has one pattern, you can use the shorthand syntax below:

```yaml
title: ...
pattern: [a, b, c]
lists:
    ...
```

### YAML and JSON
The format used in the examples above is YAML, but you can also use equivalent JSON.
