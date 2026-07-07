package com.medisync.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Static pincode-to-coordinates mapping.
 * Covers Kolkata (700xxx) pincodes with approximate lat/long.
 * All other pincodes get a default Kolkata center coordinate as fallback.
 */
@Service
public class PincodeCoordinateService {

    private static final BigDecimal DEFAULT_LAT = new BigDecimal("22.5726");
    private static final BigDecimal DEFAULT_LNG = new BigDecimal("88.3639");

    private static final Map<String, double[]> PINCODE_MAP = new HashMap<>();

    static {
        // Kolkata 700xxx pincodes - approximate coordinates
        PINCODE_MAP.put("700001", new double[]{22.5726, 88.3639}); // GPO / BBD Bagh
        PINCODE_MAP.put("700002", new double[]{22.5580, 88.3500}); // Hastings
        PINCODE_MAP.put("700003", new double[]{22.5530, 88.3430}); // Fort William
        PINCODE_MAP.put("700004", new double[]{22.5475, 88.3425}); // Alipore
        PINCODE_MAP.put("700005", new double[]{22.5400, 88.3380}); // Chetla
        PINCODE_MAP.put("700006", new double[]{22.5670, 88.3530}); // Taltala
        PINCODE_MAP.put("700007", new double[]{22.5800, 88.3620}); // Jorasanko
        PINCODE_MAP.put("700008", new double[]{22.5930, 88.3710}); // Rajabazar
        PINCODE_MAP.put("700009", new double[]{22.5850, 88.3530}); // Shyambazar
        PINCODE_MAP.put("700010", new double[]{22.5620, 88.3680}); // Chandni Chowk
        PINCODE_MAP.put("700011", new double[]{22.5560, 88.3700}); // Kidderpore
        PINCODE_MAP.put("700012", new double[]{22.5480, 88.3550}); // Bhowanipore
        PINCODE_MAP.put("700013", new double[]{22.5170, 88.3430}); // Kalighat
        PINCODE_MAP.put("700014", new double[]{22.5330, 88.3480}); // Tollygunge
        PINCODE_MAP.put("700015", new double[]{22.5620, 88.3450}); // Entally
        PINCODE_MAP.put("700016", new double[]{22.5170, 88.3630}); // Park Street
        PINCODE_MAP.put("700017", new double[]{22.5440, 88.3630}); // Ballygunge
        PINCODE_MAP.put("700018", new double[]{22.5660, 88.3800}); // Tangra
        PINCODE_MAP.put("700019", new double[]{22.5530, 88.3720}); // Tiljala
        PINCODE_MAP.put("700020", new double[]{22.5350, 88.3630}); // Dhakuria
        PINCODE_MAP.put("700021", new double[]{22.5230, 88.3470}); // Jadavpur
        PINCODE_MAP.put("700022", new double[]{22.5930, 88.3480}); // Hatibagan
        PINCODE_MAP.put("700023", new double[]{22.5700, 88.3400}); // College Street
        PINCODE_MAP.put("700024", new double[]{22.5140, 88.3700}); // Gariahat
        PINCODE_MAP.put("700025", new double[]{22.5300, 88.3720}); // Kasba
        PINCODE_MAP.put("700026", new double[]{22.5480, 88.3680}); // Ballygunge Place
        PINCODE_MAP.put("700027", new double[]{22.5350, 88.3560}); // Mudiali
        PINCODE_MAP.put("700028", new double[]{22.5850, 88.3580}); // Beadon Street
        PINCODE_MAP.put("700029", new double[]{22.5087, 88.3671}); // Gariahat Road
        PINCODE_MAP.put("700030", new double[]{22.5100, 88.3530}); // Jadavpur University
        PINCODE_MAP.put("700031", new double[]{22.5050, 88.3700}); // Golpark
        PINCODE_MAP.put("700032", new double[]{22.5020, 88.3760}); // Garia
        PINCODE_MAP.put("700033", new double[]{22.5780, 88.3930}); // EM Bypass North
        PINCODE_MAP.put("700034", new double[]{22.5970, 88.3450}); // Sinthee
        PINCODE_MAP.put("700035", new double[]{22.5900, 88.3800}); // Ultadanga
        PINCODE_MAP.put("700036", new double[]{22.6030, 88.3620}); // Dum Dum
        PINCODE_MAP.put("700037", new double[]{22.5950, 88.3550}); // Lake Town
        PINCODE_MAP.put("700038", new double[]{22.5630, 88.4010}); // VIP Road
        PINCODE_MAP.put("700039", new double[]{22.5300, 88.3930}); // Anandapur
        PINCODE_MAP.put("700040", new double[]{22.5500, 88.3850}); // Topsia
        PINCODE_MAP.put("700041", new double[]{22.5250, 88.3350}); // New Alipore
        PINCODE_MAP.put("700042", new double[]{22.5380, 88.3300}); // Behala
        PINCODE_MAP.put("700043", new double[]{22.5680, 88.3320}); // Howrah Bridge area
        PINCODE_MAP.put("700044", new double[]{22.5750, 88.3350}); // Burrabazar
        PINCODE_MAP.put("700045", new double[]{22.5150, 88.3280}); // Thakurpukur
        PINCODE_MAP.put("700046", new double[]{22.5450, 88.4050}); // East Kolkata
        PINCODE_MAP.put("700047", new double[]{22.5180, 88.3850}); // Mukundapur
        PINCODE_MAP.put("700048", new double[]{22.5600, 88.4150}); // Chingrighata
        PINCODE_MAP.put("700049", new double[]{22.5380, 88.3250}); // Sakherbazar
        PINCODE_MAP.put("700050", new double[]{22.5200, 88.3180}); // Joka
        PINCODE_MAP.put("700051", new double[]{22.5550, 88.3250}); // Maheshtala
        PINCODE_MAP.put("700052", new double[]{22.5680, 88.3920}); // Beliaghata
        PINCODE_MAP.put("700053", new double[]{22.5450, 88.3780}); // Picnic Garden
        PINCODE_MAP.put("700054", new double[]{22.5620, 88.3950}); // Phoolbagan
        PINCODE_MAP.put("700055", new double[]{22.5900, 88.3940}); // Kankurgachi
        PINCODE_MAP.put("700056", new double[]{22.6100, 88.3700}); // Nagerbazar
        PINCODE_MAP.put("700057", new double[]{22.5980, 88.3900}); // Baguiati
        PINCODE_MAP.put("700058", new double[]{22.6150, 88.4020}); // Birati
        PINCODE_MAP.put("700059", new double[]{22.6200, 88.3850}); // Jessore Road
        PINCODE_MAP.put("700060", new double[]{22.5500, 88.3180}); // Garden Reach
        PINCODE_MAP.put("700061", new double[]{22.5600, 88.3100}); // Metiabruz
        PINCODE_MAP.put("700062", new double[]{22.4900, 88.3300}); // Sonarpur
        PINCODE_MAP.put("700063", new double[]{22.5550, 88.3050}); // Remount Road
        PINCODE_MAP.put("700064", new double[]{22.6050, 88.4100}); // Airport area
        PINCODE_MAP.put("700065", new double[]{22.5150, 88.4000}); // Patuli
        PINCODE_MAP.put("700066", new double[]{22.5800, 88.4100}); // Keshtopur
        PINCODE_MAP.put("700067", new double[]{22.5420, 88.4150}); // Bantala
        PINCODE_MAP.put("700068", new double[]{22.5750, 88.4200}); // Beleghata
        PINCODE_MAP.put("700069", new double[]{22.6000, 88.4200}); // Rajarhat
        PINCODE_MAP.put("700070", new double[]{22.5830, 88.3200}); // Dakshineswar
        PINCODE_MAP.put("700071", new double[]{22.5480, 88.3150}); // Taratala
        PINCODE_MAP.put("700072", new double[]{22.6050, 88.3500}); // Belgachia
        PINCODE_MAP.put("700073", new double[]{22.5930, 88.3350}); // Cossipore
        PINCODE_MAP.put("700074", new double[]{22.5350, 88.4200}); // East Kolkata Wetlands
        PINCODE_MAP.put("700075", new double[]{22.6100, 88.4150}); // New Town adjacent
        PINCODE_MAP.put("700076", new double[]{22.5500, 88.3070}); // Sankrail
        PINCODE_MAP.put("700077", new double[]{22.6180, 88.3950}); // Teghoria
        PINCODE_MAP.put("700078", new double[]{22.5050, 88.3900}); // Narendrapur
        PINCODE_MAP.put("700079", new double[]{22.5650, 88.3150}); // Watgunge
        PINCODE_MAP.put("700080", new double[]{22.5720, 88.3280}); // Shibpur adjacent
        PINCODE_MAP.put("700081", new double[]{22.5250, 88.4100}); // Santoshpur
        PINCODE_MAP.put("700082", new double[]{22.5700, 88.4050}); // CIT Road
        PINCODE_MAP.put("700083", new double[]{22.5850, 88.4150}); // Narkeldanga
        PINCODE_MAP.put("700084", new double[]{22.5950, 88.4100}); // Maniktala
        PINCODE_MAP.put("700085", new double[]{22.5350, 88.4050}); // Bagha Jatin
        PINCODE_MAP.put("700086", new double[]{22.5100, 88.3850}); // Haltu
        PINCODE_MAP.put("700087", new double[]{22.5420, 88.3880}); // Kasba Industrial
        PINCODE_MAP.put("700088", new double[]{22.4950, 88.3950}); // Kamalgazi
        PINCODE_MAP.put("700089", new double[]{22.5680, 88.4250}); // EM Bypass East
        PINCODE_MAP.put("700090", new double[]{22.4850, 88.3850}); // Rajpur
        PINCODE_MAP.put("700091", new double[]{22.5726, 88.4313}); // Salt Lake Sector V
        PINCODE_MAP.put("700092", new double[]{22.5800, 88.4200}); // Salt Lake
        PINCODE_MAP.put("700093", new double[]{22.5650, 88.4350}); // Salt Lake Sector III
        PINCODE_MAP.put("700094", new double[]{22.5550, 88.4250}); // Salt Lake Sector I
        PINCODE_MAP.put("700095", new double[]{22.5450, 88.4350}); // EM Bypass South
        PINCODE_MAP.put("700096", new double[]{22.5900, 88.4350}); // Kestopur
        PINCODE_MAP.put("700097", new double[]{22.5350, 88.4300}); // Mukundapur East
        PINCODE_MAP.put("700098", new double[]{22.6050, 88.4300}); // Rajarhat Gopalpur
        PINCODE_MAP.put("700099", new double[]{22.5500, 88.4400}); // New Town East
        PINCODE_MAP.put("700100", new double[]{22.5950, 88.4450}); // New Town
        PINCODE_MAP.put("700101", new double[]{22.5850, 88.4500}); // New Town Action Area I
        PINCODE_MAP.put("700102", new double[]{22.5750, 88.4550}); // New Town Action Area II
        PINCODE_MAP.put("700103", new double[]{22.5650, 88.4450}); // New Town Action Area III
        PINCODE_MAP.put("700104", new double[]{22.6100, 88.4500}); // Rajarhat North
        PINCODE_MAP.put("700105", new double[]{22.6200, 88.4400}); // Gopalpur
        PINCODE_MAP.put("700106", new double[]{22.5350, 88.3150}); // Parnasree
        PINCODE_MAP.put("700107", new double[]{22.5250, 88.3100}); // Behala South
        PINCODE_MAP.put("700108", new double[]{22.5150, 88.3050}); // Sarsuna
        PINCODE_MAP.put("700109", new double[]{22.5050, 88.2950}); // Joka South
        PINCODE_MAP.put("700110", new double[]{22.4950, 88.3100}); // Diamond Harbour Road
        PINCODE_MAP.put("700111", new double[]{22.6300, 88.3750}); // Dum Dum Cantonment
        PINCODE_MAP.put("700112", new double[]{22.6350, 88.4050}); // Airport Colony
        PINCODE_MAP.put("700113", new double[]{22.6400, 88.4200}); // Madhyamgram adjacent
        PINCODE_MAP.put("700114", new double[]{22.6500, 88.4100}); // North Dum Dum
        PINCODE_MAP.put("700115", new double[]{22.5080, 88.4100}); // Garia South
        PINCODE_MAP.put("700116", new double[]{22.4800, 88.3950}); // Narendrapur South
        PINCODE_MAP.put("700117", new double[]{22.4700, 88.3850}); // Sonarpur South
        PINCODE_MAP.put("700118", new double[]{22.5600, 88.4500}); // Eastern Bypass
        PINCODE_MAP.put("700119", new double[]{22.5450, 88.4550}); // Baruipur Road
        PINCODE_MAP.put("700120", new double[]{22.5300, 88.4500}); // South City

        // Howrah area
        PINCODE_MAP.put("711101", new double[]{22.5958, 88.2636}); // Howrah
        PINCODE_MAP.put("711102", new double[]{22.5870, 88.2700}); // Howrah South
        PINCODE_MAP.put("711103", new double[]{22.5750, 88.2800}); // Shibpur
        PINCODE_MAP.put("711104", new double[]{22.6100, 88.2500}); // Bally
        PINCODE_MAP.put("711105", new double[]{22.5600, 88.2900}); // Santragachi
    }

    /**
     * Returns [latitude, longitude] for a given pincode.
     * If pincode starts with 700 but isn't mapped, returns approximate Kolkata center.
     * If pincode is from another area entirely, returns a default static coordinate.
     */
    public BigDecimal[] getCoordinates(String pincode) {
        if (pincode == null || pincode.isBlank()) {
            return new BigDecimal[]{DEFAULT_LAT, DEFAULT_LNG};
        }

        String cleanPincode = pincode.trim();

        // Exact match
        if (PINCODE_MAP.containsKey(cleanPincode)) {
            double[] coords = PINCODE_MAP.get(cleanPincode);
            return new BigDecimal[]{BigDecimal.valueOf(coords[0]), BigDecimal.valueOf(coords[1])};
        }

        // If 700xxx prefix, return Kolkata center
        if (cleanPincode.startsWith("700")) {
            return new BigDecimal[]{DEFAULT_LAT, DEFAULT_LNG};
        }

        // If 711xxx prefix (Howrah), return Howrah center
        if (cleanPincode.startsWith("711")) {
            return new BigDecimal[]{new BigDecimal("22.5958"), new BigDecimal("88.2636")};
        }

        // Default fallback for all other pincodes
        return new BigDecimal[]{DEFAULT_LAT, DEFAULT_LNG};
    }
}
